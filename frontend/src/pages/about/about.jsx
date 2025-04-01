import React from "react";
import { FormattedMessage } from "react-intl";
import "./about.css";
import logo from "../../data/logo.png";
import flashcard from "../../data/flashcard.png";

import owo from "../../data/box_owo.png";
import smile from "../../data/box_smile.png";
import tongue from "../../data/box_tongue.png";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="container-about">
      <section className="top-section-about">
        <div className="window-about">
          <section className="login-about">
            <Link className="link" to="/login">
              <span>
                <FormattedMessage id="about.login" defaultMessage="Log in" />
              </span>
            </Link>
            <Link
              to="/login"
              state={{ display: "register" }}
            >
              <span>
                <FormattedMessage
                  id="about.register"
                  defaultMessage="Register"
                />
              </span>
            </Link>
          </section>
        </div>
      </section>

      <section className="section-fullwidth">
        <div className="window-about">
          <div className="section-title-about"></div>
          <div className="content-about">
            <div className="leftsection-about">
              <span className="title-about">Memolingo</span>
              <span className="text-about">
                <FormattedMessage
                  id="about.intro"
                  defaultMessage="Discover the world of words with ease! 3,000 B2 words and 2,000 C1 words await you – learn them easily with flashcards and the Leitner system!"
                />
              </span>
            </div>
            <div className="rightsection-about">
              <img alt="logo" className="logo-about" src={logo} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-fullwidth second-section">
        <div className="window-about">
          <div className="section-title-about">
            <FormattedMessage
              id="about.flashcards"
              defaultMessage="Flashcards"
            />
          </div>
          <div className="content-about">
            <div className="flashcard-about">
              <img
                alt="flashcard"
                className="flashcard1-about"
                src={flashcard}
              />
              <img
                alt="flashcard"
                className="flashcard2-about"
                src={flashcard}
              />
            </div>

            <div className="leftsection-about">
              <span className="text-about">
                <FormattedMessage
                  id="about.flashcardDescription"
                  defaultMessage="Flashcards are small cards with information on both sides: a question or word on one side, and an answer or translation on the other. They facilitate memorization through regular reviews and engaging memory. Ideal for language learning and other subjects."
                />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-fullwidth">
        <div className="window-about">
          <div className="section-title-about">
            <FormattedMessage
              id="about.leitnerSystem"
              defaultMessage="Leitner System"
            />
          </div>
          <div className="content-about">
            <div className="leftsection-about">
              <span className="text-about">
                <FormattedMessage
                  id="about.leitnerDescription"
                  defaultMessage="The Leitner system is a friendly learning method where your flashcards move between boxes depending on your answers. A correct answer moves the flashcard forward, while an incorrect answer moves it back for another review. Learn effectively and with a smile using this proven system!"
                />
              </span>
            </div>
            <div className="flashcard-about">
              <img alt="flashcard" className="box1-about" src={smile} />
              <img alt="flashcard" className="box2-about" src={tongue} />
              <img alt="flashcard" className="box3-about" src={owo} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-footer-about">
        <div className="window-about footer-about"></div>
      </section>
    </div>
  );
}
