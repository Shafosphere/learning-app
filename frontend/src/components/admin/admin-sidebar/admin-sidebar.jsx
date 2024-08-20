import "./admin-sidebar.css";
import { MdReportProblem } from "react-icons/md";
import { FaDatabase, FaUsers } from "react-icons/fa";
import { ImStatsDots } from "react-icons/im";

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

      <div onClick={()=> setActivePanel('data')} className="plate first">
        <span className="plate-icon">
          <ImStatsDots />
        </span>
        <span className="plate-title">data</span>
      </div>

      <div onClick={()=> setActivePanel('users')} className="plate first">
        <span className="plate-icon">
          <FaUsers />
        </span>
        <span className="plate-title">users</span>
      </div>

    </div>
  );
}
