import "./flashcard.css";
export default function Flashcard({data}) {

  return (
    <>
      <div className="container-flashcard">
        <div className="window-flashcard">
          <span>word</span>
          <input></input>
        </div>
        <div className="flashcard-description"></div>
      </div>
    </>
  );
}
