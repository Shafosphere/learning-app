import "./bar.css";
export default function Progressbar({procent, text}) {
  return (
    <>
      <div className="container-bar">
        <div className="wrapper">
          <div className="progressbar"
            style={{ "--barGradient": `#fffffe 0%, #fffffe ${procent}%, #00ebc7 ${procent}%, #00ebc7 100%` }}
            >
            <div className="stylization"></div>
          </div>
        </div>
        <span className="bar-text">{text}</span>
      </div>
    </>
  );
}
