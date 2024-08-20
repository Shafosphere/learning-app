import "./admin.css";
import AdminSidebar from "../../components/admin/admin-sidebar/admin-sidebar";
import ReportsPanel from "../../components/admin/panel-reports/panel-reports";
import WordsPanel from "../../components/admin/panel-words/panel-words";
import UsersPanel from "../../components/admin/panel-users/panel-users";
import { useState } from "react";

export default function AdminPanel() {

  const [activePanel, setActivePanel] = useState("words");

  return (
    <div className="container-admin">
      <AdminSidebar setActivePanel={setActivePanel} />
      {activePanel === "reports" && <ReportsPanel />}
      {activePanel === "words" && <WordsPanel />}
      {activePanel === "users" && <UsersPanel />}
    </div>
  );
}
