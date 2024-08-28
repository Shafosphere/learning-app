export default function Card({ word, state, delay }) {
  return (
    <div className={`card ${state}`} style={{ "--delay": delay }}>
      <div className="content">
        <div className="details">
          <span className="name">{word}</span>
        </div>
      </div>
    </div>
  );
}
