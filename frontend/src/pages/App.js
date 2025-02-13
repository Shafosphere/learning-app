import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import MainGame from "./mainGame/maingame";
import MainGameSelect from "./mainGame/maingameselect";
import Settings from "./settings/settings";
import Login from "./login/login";
import Sidebar from "../components/sidebar/sidebar";
import AdminPanel from "./admin/admin";
import PrivateRoute from "../utils/privateroute";
import Account from "./account/account";
import Ranking from "./ranking/ranking";
import About from "./about/about";
import NotFound from "./notfound/notfound";
import { SettingsProvider, SettingsContext } from "./settings/properties";
import { IntlProvider } from "react-intl";
import enMessages from "../locales/en.json";
import plMessages from "../locales/pl.json";
import { PopupProvider } from "../components/popup/popupcontext";
import Vocabulary from "./voca/vocabulary";
import ResetPassword from "./resetPassword/resetpassword";
// Obiekt zawierający tłumaczenia dla różnych języków
const messages = {
  en: enMessages,
  pl: plMessages,
};

// Komponent do owijania całej aplikacji z `IntlProvider`
const AppWrapper = () => {
  const { language, isLoggedIn } = useContext(SettingsContext);

  return (
    <IntlProvider locale={language} messages={messages[language]}>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Navigate to="/about" replace />} />
        <Route path="/maingame" element={<MainGameSelect />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={isLoggedIn ? <Account /> : <Login />} />
        <Route path="/vocabulary" element={<Vocabulary />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          }
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </IntlProvider>
  );
};

function App() {
  return (
    <SettingsProvider>
      <PopupProvider>
        <AppWrapper />
      </PopupProvider>
    </SettingsProvider>
  );
}

export default App;
