import "./bar.css";
export default function Progressbar({ procent, text, barHeight = "500px" }) {
  const newpercent = 100 - procent;
  return (
    <>
      <div className="container-bar">
        <div className="wrapper">
          <div
            className="progressbar"
            style={{
              "--barGradient": `var(--secondary) 0%, var(--secondary) ${newpercent}%, var(--highlight) ${newpercent}%, var(--highlight) 100%`,
              height: barHeight, 
            }}
          >
            <div className="stylization"></div>
          </div>
        </div>
        {text && <span className="bar-text">{text}</span>}
      </div>
    </>
  );
}
