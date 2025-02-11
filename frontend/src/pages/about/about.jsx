import React from "react";
// import { FormattedMessage } from "react-intl";
import "./about.css";
import logo from "../../data/logo.png";

export default function About() {
  return (
    <div className="container-about">
      <div className="window-about">
        <section className="main-about">
          <div className="left-about">
            <span className="title-about">Memolingo</span>
            <span className="content-about">
              Aplikacja do nauki słówek bazuje na liście Oxford 3000 i Oxford
              5000, umożliwiając skuteczną naukę poprzez interaktywne fiszki
              oraz system Leitnera.
            </span>
          </div>
          <div className="right-about">
            <img alt="logo" className="logo-about" src={logo} />
          </div>
        </section>
      </div>
    </div>
  );
}
