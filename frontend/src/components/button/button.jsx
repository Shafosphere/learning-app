import "./button.css";

export default function MyButton({ message, color, onClick, width = "12rem" }) {
  const colorMapping = {
    red: "var(--secondary)",
    yellow: "var(--tertiary)",
    green: "var(--highlight)",
  };

  const buttonColor = colorMapping[color] || "var(--highlight)";

  return (
    <button
      className="button"
      style={{
        "--buttonColor": buttonColor,
        width: width ? `${width}rem` : null, // Ustawienie szerokości, jeśli przekazano
      }}
      onClick={onClick}
      type="button" 
    >
      {message}
    </button>
  );
}

//  <MyButton message="Confirm" color="red" onClick={handleConfirm} />