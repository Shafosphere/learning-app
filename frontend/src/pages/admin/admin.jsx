import "./admin.css";
import AdminSidebar from "../../components/admin/admin-sidebar/admin-sidebar";
import ReportsPanel from "../../components/admin/panel-reports/panel-reports";
import WordsPanel from "../../components/admin/panel-words/panel-words";
import UsersPanel from "../../components/admin/panel-users/panel-users";
import DataPanel from "../../components/admin/panel-data/panel-data";

import { useState } from "react";

export default function AdminPanel() {

  const [activePanel, setActivePanel] = useState("users");

  return (
    <div className="container-admin">
      <AdminSidebar setActivePanel={setActivePanel} />
      {activePanel === "reports" && <ReportsPanel />}
      {activePanel === "words" && <WordsPanel />}
      {activePanel === "users" && <UsersPanel />}
      {activePanel === "data" && <DataPanel />}
    </div>
  );
}
