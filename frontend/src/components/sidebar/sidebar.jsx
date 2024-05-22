import "./sidebar.css";
import { LuMenuSquare } from "react-icons/lu";
import { FaGithub } from "react-icons/fa";

export default function Sidebar() {
  return (
    <>
      <div className="container-sidebar">
        <div className="small-sidebar">
          <LuMenuSquare />
        </div>
        <div className="big-sidebar">
          <div className="title-sidebar"><span>My App</span></div>
          <div className="links-sidebar">
            <span>Home</span>
            <span>Settings</span>
          </div>
          <div className="github-sidebar">
            <div className="bar">
              <div className="border"></div>
            </div>
            <FaGithub />
            <div className="bar">
              <div className="border"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
