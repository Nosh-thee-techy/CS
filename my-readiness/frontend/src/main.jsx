import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ReadinessProvider } from "./context/ReadinessContext.jsx";
import "./i18n/index.js";
import "./index.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ReadinessProvider>
      <App />
    </ReadinessProvider>
  </React.StrictMode>,
);
