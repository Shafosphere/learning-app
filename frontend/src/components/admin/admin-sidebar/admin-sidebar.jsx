import "./admin-sidebar.css";
import { MdReportProblem } from "react-icons/md";
import { FaDatabase, FaUsers } from "react-icons/fa";
import { FaCrown } from "react-icons/fa";

export default function AdminSidebar({ setActivePanel }) {
  return (
    <div className="container-adminsidebar">

      <div onClick={() => setActivePanel("main")} className="plate first">
        <span className="plate-icon">
          <FaCrown />
        </span>
        <span className="plate-title">main</span>
      </div>

      <div onClick={() => setActivePanel("reports")} className="plate first">
        <span className="plate-icon">
          <MdReportProblem />
        </span>
        <span className="plate-title">reports</span>
      </div>

      <div onClick={() => setActivePanel("words")} className="plate first">
        <span className="plate-icon">
          <FaDatabase />
        </span>
        <span className="plate-title">Words</span>
      </div>
      <div onClick={() => setActivePanel("users")} className="plate first">
        <span className="plate-icon">
          <FaUsers />
        </span>
        <span className="plate-title">users</span>
      </div>
    </div>
  );
}
