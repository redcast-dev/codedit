import React from "react";
import ReactDOM from "react-dom/client";
import AppProfessional from "./App.professional.jsx";
import AppLegacy from "./App.jsx";
import "./index.css";

// Toggle between professional and legacy UI
// Set to true for the new professional UI, false for legacy
const USE_PROFESSIONAL_UI = true;

const App = USE_PROFESSIONAL_UI ? AppProfessional : AppLegacy;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
