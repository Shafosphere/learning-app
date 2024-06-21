import "./sidebar.css";
import { LuMenuSquare } from "react-icons/lu";
import { FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { MdAccountBox } from "react-icons/md";

export default function Sidebar() {
  return (
    <>
      <div className="container-sidebar">
        <div className="small-sidebar">
          <LuMenuSquare />
        </div>
        <div className="big-sidebar">
          <div className="title-sidebar">
            <span>Memolingo</span>
          </div>
          <div className="links-sidebar">
            <div className="links-container">
              <div className="one">
                <Link to="/home">
                  <IoMdHome />
                </Link>
              </div>
              <div className="two">
                <Link to="/settings">
                  <IoMdSettings />
                </Link>
              </div>
              <div className="three">
                <Link to="/login">
                  <MdAccountBox />
                </Link>
              </div>
              <div className="four"></div>
              <div className="five"></div>
              <div className="six"></div>
              <div className="seven"></div>
              <div className="eight"></div>
              <div className="nine"></div>
            </div>
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
