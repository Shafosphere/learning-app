import "./progressbar.css";

export default function NewProgressBar({ percent, text }) {
  return (
    <div className="progress-container">
      {text && <span className="progress-text">{text}</span>}
      <div
        className="progress-wrapper"
        style={{
          "--progress-gradient": `linear-gradient(to right, var(--highlight) ${percent}%, var(--secondary) ${percent}%)`,
        }}
      >
        <div className="progress-bar">
          <div className="progress-bar-stylization">
            <div className="short-belt"></div>
            <div className="long-belt"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
