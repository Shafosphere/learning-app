import "./bar.css";
export default function Progressbar({procent, text}) {
  const newpercent = 100 - procent
  return (
    <>
      <div className="container-bar">
        <div className="wrapper">
          <div className="progressbar"
            style={{ "--barGradient": `#fffffe 0%, #fffffe ${newpercent}%, #00ebc7 ${newpercent}%, #00ebc7 100%` }}
            >
            <div className="stylization"></div>
          </div>
        </div>
        <span className="bar-text">{text}</span>
      </div>
    </>
  );
}
