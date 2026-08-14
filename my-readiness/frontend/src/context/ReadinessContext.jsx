import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  cacheProfile,
  completeAction as postComplete,
  fetchReadiness,
  readCachedProfile,
  requestOtp as postOtp,
  submitLoan as postLoan,
} from "../api/readiness.js";
import { rememberMemberLocale } from "../i18n/index.js";

const ReadinessContext = createContext(null);

export function ReadinessProvider({ children }) {
  const { i18n } = useTranslation();
  const extraPaymentsRef = useRef({});
  const [lookup, setLookup] = useState("");
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("score");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromCache, setFromCache] = useState(false);
  const [toast, setToast] = useState("");
  const [loanError, setLoanError] = useState("");
  const [loanBusy, setLoanBusy] = useState(false);
  const [otpHint, setOtpHint] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("lookup");
    const nextTab = params.get("tab");
    if (nextTab === "score" || nextTab === "loan" || nextTab === "improve") {
      setTab(nextTab);
    }
    if (query) {
      lookupFarmer(query);
    }
    // Deep-link from Lima na Loop — run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function mergePayments(next, query) {
    const extra = extraPaymentsRef.current[String(query || "").trim().toUpperCase()] || [];
    if (!extra.length || !next) return next;
    const existing = new Set((next.payments || []).map((payment) => payment.id));
    const fresh = extra.filter((payment) => !existing.has(payment.id));
    if (!fresh.length) return next;
    return { ...next, payments: [...fresh, ...(next.payments || [])] };
  }

  async function loadProfile(query, { keepTab = false } = {}) {
    const next = mergePayments(await fetchReadiness(query, i18n.language), query);
    setProfile(next);
    cacheProfile(query, next);
    setFromCache(false);
    if (!keepTab) setTab("score");
    rememberMemberLocale(query, i18n.language);
    return next;
  }

  async function lookupFarmer(value) {
    const query = value.trim();
    setLookup(query);
    setLoading(true);
    setError("");
    setFromCache(false);
    setLoanError("");
    setOtpHint("");
    setTab("score");

    try {
      await loadProfile(query);
    } catch (err) {
      const cached = readCachedProfile(query);
      if (cached?.profile) {
        setProfile(mergePayments(cached.profile, query));
        setFromCache(true);
        setError(err.code === "not_found" ? "notFound" : "");
      } else {
        setProfile(null);
        setError(
          err.code === "not_found" ? "notFound" : err.code === "rateLimited" ? "rateLimited" : "network",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function refreshProfile() {
    if (!lookup) return;
    try {
      await loadProfile(lookup, { keepTab: true });
    } catch {
      setFromCache(true);
    }
  }

  async function reportAction(actionId, evidence = {}) {
    if (!lookup || !profile) return;
    const meta = {
      photo: Boolean(evidence.photo),
      audio: Boolean(evidence.audio),
      note: Boolean(String(evidence.note || "").trim()),
    };
    setProfile((current) => ({
      ...current,
      actions: current.actions.map((action) =>
        action.id === actionId ? { ...action, selfReported: true, evidence: meta } : action,
      ),
    }));

    try {
      await postComplete(lookup, actionId, evidence);
      setToast("success");
      setProfile((current) => {
        cacheProfile(lookup, current);
        return current;
      });
    } catch {
      setProfile((current) => ({
        ...current,
        actions: current.actions.map((action) =>
          action.id === actionId ? { ...action, selfReported: false, evidence: null } : action,
        ),
      }));
      setToast("error");
      throw new Error("report_failed");
    }
  }

  async function sendLoanOtp() {
    if (!lookup) return;
    setLoanError("");
    try {
      const result = await postOtp(lookup);
      setOtpHint(result.demoCode || "");
      return result;
    } catch (err) {
      setLoanError(err.message || "Couldn't submit right now. Try again.");
      throw err;
    }
  }

  async function applyForLoan(purpose, otpCode, requestedAmount) {
    if (!lookup || !profile?.disbursementEligible) return;
    setLoanBusy(true);
    setLoanError("");
    try {
      const result = await postLoan(lookup, purpose, otpCode);
      const requested = Number(requestedAmount) || result.application?.amount;
      setProfile((current) => {
        const next = {
          ...current,
          loanApplication: {
            ...result.application,
            requestedAmount: requested,
          },
        };
        cacheProfile(lookup, next);
        return next;
      });
    } catch (err) {
      setLoanError(err.message || "Couldn't submit right now. Try again.");
    } finally {
      setLoanBusy(false);
    }
  }

  async function repayLoan(amount) {
    if (!lookup || !profile) return;
    const kes = Number(amount) || 0;
    if (kes <= 0) return;

    const payment = {
      id: `pay_local_${Date.now()}`,
      kind: "loan_repayment",
      kindLabel: "Loan repayment",
      amount: kes,
      rawStatus: "pending",
      status: "Pending",
      localOnly: true,
    };

    const key = lookup.trim().toUpperCase();
    extraPaymentsRef.current[key] = [payment, ...(extraPaymentsRef.current[key] || [])];

    setProfile((current) => {
      const next = { ...current, payments: [payment, ...(current.payments || [])] };
      cacheProfile(lookup, next);
      return next;
    });
  }

  function reset() {
    setLookup("");
    setProfile(null);
    setTab("score");
    setError("");
    setFromCache(false);
    setToast("");
    setLoanError("");
    setOtpHint("");
  }

  const value = useMemo(
    () => ({
      lookup,
      profile,
      tab,
      setTab,
      loading,
      error,
      fromCache,
      toast,
      setToast,
      loanError,
      loanBusy,
      otpHint,
      lookupFarmer,
      refreshProfile,
      reportAction,
      sendLoanOtp,
      applyForLoan,
      repayLoan,
      reset,
    }),
    [lookup, profile, tab, loading, error, fromCache, toast, loanError, loanBusy, otpHint, i18n.language],
  );

  return <ReadinessContext.Provider value={value}>{children}</ReadinessContext.Provider>;
}

export function useReadiness() {
  const ctx = useContext(ReadinessContext);
  if (!ctx) throw new Error("useReadiness must be used inside ReadinessProvider");
  return ctx;
}
