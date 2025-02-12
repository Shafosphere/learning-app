import React from "react";
// import { FormattedMessage } from "react-intl";
import "./about.css";
import logo from "../../data/logo.png";

export default function About() {
  return (
    <div className="container-about">
      <section className="top-section-about">
        <div className="window-about">
          <section className="login-about">
            <span>zaloguj sie</span>
            <span>zarejestruj sie</span>
          </section>
        </div>
      </section>

      <section className="section-fullwidth">
        <div className="window-about">
          <div className="section-title-about">
            {/* Możesz dodać tytuł lub pozostawić pusty */}
          </div>
          <div className="content-about">
            <div className="leftsection-about">
              <span className="title-about">Memolingo</span>
              <span className="text-about">
                Poznaj świat słówek z łatwizną! 🌟 3000 słów B2 i 2000 słów C1
                czekają na Ciebie – ucz się ich łatwo dzięki fiszkom i metodzie
                Leitnera! 🚀💡
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
          <div className="section-title-about">fiszki</div>
          <div className="content-about">
            <div className="leftsection-about">
              <span className="text-about">
                Fiszki to niewielkie kartoniki z informacją na obu stronach: z
                jednej pytanie lub słowo, z drugiej odpowiedź lub tłumaczenie.
                Ułatwiają zapamiętywanie poprzez regularne powtórki i
                angażowanie pamięci. Idealne do nauki języków i innych dziedzin.
              </span>
            </div>
            <div className="rightsection-about">
              <img alt="logo" className="logo-about" src={logo} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-fullwidth">
        <div className="window-about">
          <div className="section-title-about">nigdy wiecej nudy!</div>
          <div className="content-about">
            <div className="leftsection-about">
              <span className="text-about">
                „przeczytaj, zasłoń dłonią, powtórz w myślach” brzmi jak
                echa minionej epoki – nijaka i mało angażująca. W
                przeciwieństwie do fiszek, które wprowadzają interaktywne
                powtórki i pobudzają pamięć, ta stara technika nie rozbudza
                wyobraźni. Postaw na fiszki, a nauka stanie się dynamiczna i
                pełna życia!
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
          <div className="section-title-about">Leitner system</div>
          <div className="content-about">
            <div className="leftsection-about">
              <span className="text-about">
                System Leitnera to przyjazna metoda nauki, w której Twoje fiszki
                przesuwają się między pudełkami w zależności od Twoich
                odpowiedzi. Poprawna odpowiedź przesuwa fiszkę do kolejnego
                pudełka, a błąd sprowadza ją z powrotem, umożliwiając kolejną
                powtórkę. Ucz się efektywnie i z uśmiechem, korzystając z tego
                ciepłego systemu!
              </span>
            </div>
            <div className="rightsection-about">
              <img alt="logo" className="logo-about" src={logo} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-fullwidth">
        stpóka
        dodac płynne animacje podczas wejscia na strone
      </section>
    </div>
  );
}
