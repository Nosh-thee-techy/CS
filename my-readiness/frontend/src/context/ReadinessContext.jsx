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
import {
  getOutstandingLoans,
  getPayoutsByFarmer,
  getUnpaidProduce,
  initiatePayout,
  promptLoanRepayment,
  requestLoan,
} from "../api/platform.js";
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
  const [payoutBusy, setPayoutBusy] = useState(false);
  const [payoutError, setPayoutError] = useState("");
  const [payoutNotice, setPayoutNotice] = useState("");

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
    setPayoutError("");
    setPayoutNotice("");
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
    if (!lookup || !profile) return;
    const farmerId = profile.farmerId;
    const cooperativeId = profile.cooperativeId;
    const amount = Number(requestedAmount) || Number(profile.eligibleAmount) || 0;
    if (!farmerId || !cooperativeId || amount <= 0) {
      setLoanError("Couldn't submit right now. Try again.");
      return;
    }

    setLoanBusy(true);
    setLoanError("");
    try {
      let result;
      try {
        result = await requestLoan({
          farmerId,
          cooperativeId,
          requestedAmount: amount,
          purpose,
        });
      } catch (err) {
        if (otpCode) {
          result = { application: await postLoan(lookup, purpose, otpCode) };
        } else {
          throw err;
        }
      }

      const loan = result.loan || result.application || result;
      const requested = Number(loan.requestedAmount || loan.amount || amount);
      setProfile((current) => {
        const next = {
          ...current,
          loanApplication: {
            status: "pending",
            amount: requested,
            requestedAmount: requested,
            purpose: loan.purpose || purpose,
            reference: loan.loanId || loan.reference,
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
    if (!lookup || !profile?.farmerId) return;
    const kes = Number(amount) || 0;
    if (kes <= 0) return;

    const outstanding = await getOutstandingLoans(profile.farmerId);
    const loan = (outstanding.activeLoans || [])[0];
    if (!loan?.loanId) {
      throw new Error("No outstanding loan found.");
    }

    await promptLoanRepayment(loan.loanId, {
      amount: kes,
      mobileNo: profile.phoneNumber,
    });

    const payment = {
      id: `pay_${loan.loanId}_${Date.now()}`,
      kind: "loan_repayment",
      kindLabel: "Loan repayment",
      amount: kes,
      rawStatus: "pending",
      status: "Pending",
    };

    const key = lookup.trim().toUpperCase();
    extraPaymentsRef.current[key] = [payment, ...(extraPaymentsRef.current[key] || [])];

    setProfile((current) => {
      const next = { ...current, payments: [payment, ...(current.payments || [])] };
      cacheProfile(lookup, next);
      return next;
    });
  }

  async function requestHarvestPayout() {
    if (!profile?.farmerId || !profile?.cooperativeId) {
      setPayoutError("Couldn't start a payout right now.");
      return;
    }
    setPayoutBusy(true);
    setPayoutError("");
    setPayoutNotice("");
    try {
      const unpaid = await getUnpaidProduce(profile.farmerId).catch(() => ({ grossTotal: 0 }));
      if (!unpaid?.grossTotal) {
        throw new Error("No unpaid harvest to pay out.");
      }
      const result = await initiatePayout({
        farmerId: profile.farmerId,
        cooperativeId: profile.cooperativeId,
      });
      const payout = result.payout || result;
      setPayoutNotice(payout.payoutId || "Payout started.");
      const payouts = await getPayoutsByFarmer(profile.farmerId).catch(() => []);
      setProfile((current) => {
        const deductions = (payouts || []).map((row) => ({
          id: row.payoutId,
          reason: "loan_recovery",
          gross: Number(row.grossProduceAmount) || 0,
          deducted: Number(row.loanDeductionAmount) || 0,
          net: Number(row.netPayoutAmount) || 0,
          rawStatus: String(row.status || "").toLowerCase().includes("fail") ? "failed" : "pending",
          status: row.status,
        }));
        const next = { ...current, deductions };
        cacheProfile(lookup, next);
        return next;
      });
    } catch (err) {
      setPayoutError(err.message || "Couldn't start a payout right now.");
    } finally {
      setPayoutBusy(false);
    }
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
    setPayoutError("");
    setPayoutNotice("");
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
      payoutBusy,
      payoutError,
      payoutNotice,
      lookupFarmer,
      refreshProfile,
      reportAction,
      sendLoanOtp,
      applyForLoan,
      repayLoan,
      requestHarvestPayout,
      reset,
    }),
    [lookup, profile, tab, loading, error, fromCache, toast, loanError, loanBusy, otpHint, payoutBusy, payoutError, payoutNotice, i18n.language],
  );

  return <ReadinessContext.Provider value={value}>{children}</ReadinessContext.Provider>;
}

export function useReadiness() {
  const ctx = useContext(ReadinessContext);
  if (!ctx) throw new Error("useReadiness must be used inside ReadinessProvider");
  return ctx;
}
