import "./sidebar.css";
import { LuMenuSquare } from "react-icons/lu";
import { FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";

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
            <div class="links-container">
              <div class="one">
                <Link to="/home">
                  <IoMdHome />
                </Link>
              </div>
              <div class="two">
                <Link to="/settings">
                  <IoMdSettings />
                </Link>
              </div>
              <div class="three">
              </div>
              <div class="four"></div>
              <div class="five"></div>
              <div class="six"></div>
              <div class="seven"></div>
              <div class="eight"></div>
              <div class="nine"></div>
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
