import { createContext, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  cacheProfile,
  completeAction as postComplete,
  fetchReadiness,
  readCachedProfile,
} from "../api/readiness.js";

const ReadinessContext = createContext(null);

export function ReadinessProvider({ children }) {
  const { i18n } = useTranslation();
  const [lookup, setLookup] = useState("");
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("score");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromCache, setFromCache] = useState(false);
  const [toast, setToast] = useState("");

  async function lookupFarmer(value) {
    const query = value.trim();
    setLookup(query);
    setLoading(true);
    setError("");
    setFromCache(false);
    setTab("score");

    try {
      const next = await fetchReadiness(query, i18n.language);
      setProfile(next);
      cacheProfile(query, next);
    } catch (err) {
      const cached = readCachedProfile(query);
      if (cached?.profile) {
        setProfile(cached.profile);
        setFromCache(true);
        setError(err.code === "not_found" ? "notFound" : "");
      } else {
        setProfile(null);
        setError(err.code === "not_found" ? "notFound" : "network");
      }
    } finally {
      setLoading(false);
    }
  }

  async function reportAction(actionId) {
    if (!lookup || !profile) return;
    setProfile((current) => ({
      ...current,
      actions: current.actions.map((action) =>
        action.id === actionId ? { ...action, selfReported: true } : action,
      ),
    }));

    try {
      await postComplete(lookup, actionId);
      setToast("success");
      setProfile((current) => {
        cacheProfile(lookup, current);
        return current;
      });
    } catch {
      setProfile((current) => ({
        ...current,
        actions: current.actions.map((action) =>
          action.id === actionId ? { ...action, selfReported: false } : action,
        ),
      }));
      setToast("error");
    }
  }

  function reset() {
    setLookup("");
    setProfile(null);
    setTab("score");
    setError("");
    setFromCache(false);
    setToast("");
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
      lookupFarmer,
      reportAction,
      reset,
    }),
    [lookup, profile, tab, loading, error, fromCache, toast, i18n.language],
  );

  return <ReadinessContext.Provider value={value}>{children}</ReadinessContext.Provider>;
}

export function useReadiness() {
  const ctx = useContext(ReadinessContext);
  if (!ctx) throw new Error("useReadiness must be used inside ReadinessProvider");
  return ctx;
}
