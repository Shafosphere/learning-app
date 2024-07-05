import "./admin-sidebar.css";
import { MdReportProblem } from "react-icons/md";

export default function AdminSidebar() {
  return (
    <div className="container-adminsidebar">
      <div className="plate first">
        <span className="plate-icon">
          <MdReportProblem />
        </span>
        <span className="plate-title">reports</span>
      </div>
    </div>
  );
}
