import "./sidebar.css";
import { LuMenuSquare } from "react-icons/lu";
import { FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { MdAccountBox } from "react-icons/md";

export default function Sidebar() {
  const handleDivClick = (event) => {
    const link = event.currentTarget.querySelector('a');
    if (link) {
      link.click();
    }
  };

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
              <div className="one" onClick={handleDivClick}>
                <Link to="/home">
                  <IoMdHome />
                </Link>
              </div>
              <div className="two" onClick={handleDivClick}>
                <Link to="/settings">
                  <IoMdSettings />
                </Link>
              </div>
              <div className="three" onClick={handleDivClick}>
                <Link to="/login">
                  <MdAccountBox />
                </Link>
              </div>
              <div className="four" onClick={handleDivClick}></div>
              <div className="five" onClick={handleDivClick}></div>
              <div className="six" onClick={handleDivClick}></div>
              <div className="seven" onClick={handleDivClick}></div>
              <div className="eight" onClick={handleDivClick}></div>
              <div className="nine" onClick={handleDivClick}></div>
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
