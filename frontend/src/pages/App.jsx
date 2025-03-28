import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import MainGame from "./mainGame/maingame";
import MainGameSelect from "./mainGame/maingameselect";
import Settings from "./settings/settings";
import Login from "./login/login";
import Sidebar from "../components/sidebar/sidebar";
import AdminPanel from "./admin/admin";
import PrivateRoute from "../utils/privateroute";
import Account from "./account/account";
import RankingTableSelect from "./rankingTable/selectTable";
import RankingGame from "./rankingGame/rankingGame";
import About from "./about/about";
import NotFound from "./notfound/notfound";
import { SettingsProvider, SettingsContext } from "./settings/properties";
import { IntlProvider, useIntl } from "react-intl";
import enMessages from "../locales/en.json";
import plMessages from "../locales/pl.json";
import { PopupProvider } from "../components/popup/popupcontext";
import Vocabulary from "./voca/vocabulary";
import ResetPassword from "./resetPassword/resetpassword";
import { v4 as uuidv4 } from "uuid";
import { registerIntl } from "../utils/intlManager";
// Obiekt zawierający tłumaczenia dla różnych języków
const messages = {
  en: enMessages,
  pl: plMessages,
};

// Komponent do owijania całej aplikacji z `IntlProvider`
const AppWrapper = () => {
  const { language, isLoggedIn } = useContext(SettingsContext);

  // Nowy komponent do rejestracji intl
  const IntlRegistry = () => {
    const intl = useIntl();

    useEffect(() => {
      registerIntl(intl);
    }, [intl]);

    return null;
  };

  useEffect(() => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("deviceId", deviceId);
    }
  }, []);

  return (
    <IntlProvider
      locale={language}
      messages={messages[language]}
      onError={(err) => {
        if (err.code === "MISSING_TRANSLATION") {
          console.warn("Missing translation:", err.message);
          return;
        }
        throw err;
      }}
    >
      <PopupProvider>
        <IntlRegistry />
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/about" replace />} />
          <Route path="/maingame" element={<MainGameSelect />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/account"
            element={isLoggedIn ? <Account /> : <Login />}
          />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/rankingtable" element={<RankingTableSelect />} />
          <Route path="/rankinggame" element={<RankingGame />} />
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
      </PopupProvider>
    </IntlProvider>
  );
};

function App() {
  return (
    <SettingsProvider>
      <AppWrapper />
    </SettingsProvider>
  );
}

export default App;
