import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BottomNav from "./components/BottomNav.jsx";
import DeviceFrame from "./components/DeviceFrame.jsx";
import KaliSheet, { KaliToggle } from "./components/KaliAgent.jsx";
import LanguageSwitcher from "./components/LanguageSwitcher.jsx";
import { ScoreSkeleton } from "./components/Skeleton.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
import { useReadiness } from "./context/ReadinessContext.jsx";
import AdminScreen from "./screens/AdminScreen.jsx";
import ImproveScreen from "./screens/ImproveScreen.jsx";
import LoanScreen from "./screens/LoanScreen.jsx";
import LookupScreen from "./screens/LookupScreen.jsx";
import ScoreScreen from "./screens/ScoreScreen.jsx";

export default function App() {
  const { i18n } = useTranslation();
  const { profile, tab, setTab, loading, lookup, lookupFarmer, refreshProfile } = useReadiness();
  const [booting, setBooting] = useState(true);
  const [kaliOpen, setKaliOpen] = useState(false);
  const isAdmin = window.location.pathname.replace(/\/$/, "") === "/admin";

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (lookup && profile) {
      lookupFarmer(lookup);
    }
  }, [i18n.language]);

  useEffect(() => {
    if (tab === "improve" && lookup && profile) {
      refreshProfile();
    }
  }, [tab]);

  if (isAdmin) {
    return <AdminScreen />;
  }

  const showNav = Boolean(profile || loading);

  return (
    <DeviceFrame>
      <div className="device-scroll">
        {booting ? (
          <SplashScreen onDone={() => setBooting(false)} />
        ) : !profile && !loading ? (
          <LookupScreen />
        ) : (
          <div className="px-5 pb-28 pt-12">
            <div className="mb-4 flex justify-end">
              <LanguageSwitcher />
            </div>
            {loading && !profile ? (
              <ScoreSkeleton />
            ) : (
              <>
                {tab === "score" && <ScoreScreen />}
                {tab === "loan" && <LoanScreen />}
                {tab === "improve" && <ImproveScreen />}
              </>
            )}
          </div>
        )}
      </div>
      {!booting && !kaliOpen && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end gap-2 px-4 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
          {showNav && (
            <div className="pointer-events-auto min-w-0 flex-1">
              <BottomNav tab={tab} onChange={setTab} />
            </div>
          )}
          <div className={`pointer-events-auto ${showNav ? "" : "ml-auto"}`}>
            <KaliToggle onOpen={() => setKaliOpen(true)} />
          </div>
        </div>
      )}
      {kaliOpen && <KaliSheet onClose={() => setKaliOpen(false)} />}
    </DeviceFrame>
  );
}
