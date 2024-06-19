import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./home/home";
import Settings from "./settings/settings";
import Sidebar from "../components/sidebar/sidebar";
import { SettingsProvider, SettingsContext } from "./settings/properties";
import { IntlProvider } from 'react-intl';
import enMessages from '../locales/en.json';
import plMessages from  '../locales/pl.json';

// Obiekt zawierający tłumaczenia dla różnych języków
const messages = {
  en: enMessages,
  pl: plMessages
};

// Komponent do owijania całej aplikacji z `IntlProvider`
const AppWrapper = () => {
  const { language } = useContext(SettingsContext);

  return (
    <IntlProvider locale={language} messages={messages[language]}>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </IntlProvider>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppWrapper />
    </SettingsProvider>
  );
}

export default App;
