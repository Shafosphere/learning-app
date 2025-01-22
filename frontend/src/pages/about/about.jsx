import React from "react";
import { FormattedMessage } from "react-intl";
import "./about.css";

export default function About() {
  return (
    <div className="container-about">
      <div className="window-about">
        <section className="card-about">
          <div className="card-header-about">
            <FormattedMessage
              id="about.welcomeTitle"
              defaultMessage="Witaj w Memolingo!"
            />
          </div>
          <div className="card-content-about">
            <FormattedMessage
              id="about.welcomeContent"
              defaultMessage="W Memolingo redefiniujemy naukę języków, łącząc sprawdzone metody nauczania z nowoczesną technologią. Niezależnie od tego, czy dopiero zaczynasz swoją przygodę, czy doskonalisz umiejętności, Memolingo sprawia, że nauka staje się intuicyjna, spersonalizowana i skuteczna."
            />
          </div>
        </section>

        <section className="card-about">
          <div className="card-header-about">
            <FormattedMessage
              id="about.whatIsMemolingoTitle"
              defaultMessage="Czym jest Memolingo?"
            />
          </div>
          <div className="card-content-about">
            <FormattedMessage
              id="about.whatIsMemolingoContent"
              defaultMessage="Memolingo to nowoczesna platforma do nauki słownictwa oparta na systemie Leitnera, naukowo potwierdzonej metodzie efektywnego zapamiętywania. Dzięki integracji tego systemu z naszymi interaktywnymi narzędziami zapewniamy, że Twoja nauka będzie jednocześnie wydajna i angażująca."
            />
          </div>
        </section>

        <section className="card-about">
          <div className="card-header-about">
            <FormattedMessage
              id="about.leitnerSystemTitle"
              defaultMessage="Jak działa system Leitnera?"
            />
          </div>
          <div className="card-content-about">
            <FormattedMessage
              id="about.leitnerSystemContent"
              defaultMessage="System Leitnera to metoda powtórek rozłożonych w czasie, która pomaga w zapamiętywaniu słownictwa, pokazując słowa w różnych odstępach czasowych w zależności od Twojej znajomości. W Memolingo:"
            />
            <ul className="list-about">
              <li>
                <FormattedMessage
                  id="about.leitnerPoint1"
                  defaultMessage="Słowa, które sprawiają trudność, pojawiają się częściej."
                />
              </li>
              <li>
                <FormattedMessage
                  id="about.leitnerPoint2"
                  defaultMessage="Słowa dobrze znane wyświetlane są rzadziej, pozwalając skupić się na tym, co wymaga poprawy."
                />
              </li>
              <li>
                <FormattedMessage
                  id="about.leitnerPoint3"
                  defaultMessage="To adaptacyjne podejście maksymalizuje efektywność nauki i oszczędza czas."
                />
              </li>
            </ul>
          </div>
        </section>

        <section className="card-about">
          <div className="card-header-about">
            <FormattedMessage
              id="about.ourMissionTitle"
              defaultMessage="Nasza misja"
            />
          </div>
          <div className="card-content-about">
            <FormattedMessage
              id="about.ourMissionContent"
              defaultMessage="W Memolingo dążymy do tego, aby nauka języków była dostępna, skuteczna i przyjemna dla każdego. Łącząc tradycyjne metody, takie jak system Leitnera, z nowoczesną technologią, pomagamy Ci budować solidne umiejętności językowe z pewnością siebie."
            />
          </div>
        </section>

        <section className="card-about full-width-about">
          <div className="card-header-about">
            <FormattedMessage
              id="about.joinCommunityTitle"
              defaultMessage="Dołącz do społeczności Memolingo"
            />
          </div>
          <div className="card-content-about">
            <FormattedMessage
              id="about.joinCommunityContent"
              defaultMessage="Rozpocznij swoją podróż już dziś z Memolingo. Razem otworzymy drzwi do nowych języków, kultur i możliwości dzięki sprytniejszemu, bardziej angażującemu podejściu do nauki."
            />
          </div>
        </section>
      </div>
    </div>
  );
}
