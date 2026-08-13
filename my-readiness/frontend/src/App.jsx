import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BottomNav from "./components/BottomNav.jsx";
import LanguageSwitcher from "./components/LanguageSwitcher.jsx";
import { ScoreSkeleton } from "./components/Skeleton.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
import { useReadiness } from "./context/ReadinessContext.jsx";
import ActionsScreen from "./screens/ActionsScreen.jsx";
import AdvisoryScreen from "./screens/AdvisoryScreen.jsx";
import LookupScreen from "./screens/LookupScreen.jsx";
import ScoreScreen from "./screens/ScoreScreen.jsx";

export default function App() {
  const { i18n } = useTranslation();
  const { profile, tab, setTab, loading, lookup, lookupFarmer } = useReadiness();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (lookup && profile) {
      lookupFarmer(lookup);
    }
  }, [i18n.language]);

  if (booting) {
    return <SplashScreen onDone={() => setBooting(false)} />;
  }

  if (!profile && !loading) {
    return <LookupScreen />;
  }

  return (
    <div className="min-h-[100dvh] bg-night">
      <div className="mx-auto max-w-md px-5 pb-28 pt-4">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher />
        </div>
        {loading && !profile ? (
          <ScoreSkeleton />
        ) : (
          <>
            {tab === "score" && <ScoreScreen />}
            {tab === "actions" && <ActionsScreen />}
            {tab === "advisory" && <AdvisoryScreen />}
          </>
        )}
      </div>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
