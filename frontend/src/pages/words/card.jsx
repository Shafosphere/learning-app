import "./card.css";

export default function Card({ word, state }) {
  return (
    <div className="wrapper">
      <div className={`card ${state}`}>
        <div className="content">
          <div className="details">
            <span className="name">{word}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
