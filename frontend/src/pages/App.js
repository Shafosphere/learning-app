import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./home/home";
import Settings from "./settings/settings";
import Sidebar from "../components/sidebar/sidebar";
import { SettingsProvider } from "./settings/properties";

function App() {
  return (
    <SettingsProvider>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </SettingsProvider>
  );
}

export default App;
