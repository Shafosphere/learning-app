import "./button.css";

export default function MyButton({ message, color, onClick }) {
  const colorMapping = {
    red: "var(--secondary)",
    yellow: "var(--tertiary)",
    green: "var(--highlight)",
  };

  const buttonColor = colorMapping[color] || "var(--highlight)";

  return (
    <button
      className="button"
      style={{ "--buttonColor": buttonColor }}
      onClick={onClick}
    >
      {message}
    </button>
  );
}

//  <MyButton message="Confirm" color="red" onClick={handleConfirm} />