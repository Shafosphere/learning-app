import "./admin-sidebar.css";
import { MdReportProblem } from "react-icons/md";
import { FaDatabase } from "react-icons/fa";

export default function AdminSidebar({setActivePanel}) {
  return (
    <div className="container-adminsidebar">
      <div onClick={()=> setActivePanel('reports')} className="plate first">
        <span className="plate-icon">
          <MdReportProblem />
        </span>
        <span className="plate-title">reports</span>
      </div>
      <div onClick={()=> setActivePanel('words')} className="plate first">
        <span className="plate-icon">
          <FaDatabase />
        </span>
        <span className="plate-title">Words</span>
      </div>
    </div>
  );
}
