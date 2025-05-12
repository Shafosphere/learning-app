import "./progressbar.css";

// A customizable progress bar that can be horizontal or vertical
export default function NewProgressBar({ percent, text, vertical = false }) {
  return (
    <div className={`progress-container ${vertical ? "progress-container-vertical" : ""}`}>
      {text && (
        <span
          className={`progress-text ${vertical ? "progress-text-vertical" : ""}`}
        >
          {text}
        </span>
      )}
      <div
        className={`progress-wrapper ${vertical ? "progress-container-vertical" : ""}`}
        style={{
          // Use CSS gradient to fill up to the given percentage
          "--progress-gradient": vertical
            ? `linear-gradient(to top, var(--highlight) ${percent}%, var(--secondary) ${percent}%)`
            : `linear-gradient(to right, var(--highlight) ${percent}%, var(--secondary) ${percent}%)`,
        }}
      >
        <div className={`progress-bar ${vertical ? "progress-bar-vertical" : ""}`}>
          {vertical ? (
            // Vertical styling
            <div className="progress-bar-stylization-vertical">
              <div className="short-belt-vertical"></div>
              <div className="long-belt-vertical"></div>
            </div>
          ) : (
            // Horizontal styling
            <div className="progress-bar-stylization">
              <div className="short-belt"></div>
              <div className="long-belt"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
