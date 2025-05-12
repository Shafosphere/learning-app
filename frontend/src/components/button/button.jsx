import "./button.css";

export default function MyButton({
  message,
  color,
  onClick,
  disabled,
  width = "12rem",
}) {
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
        width: width ? `${width}rem` : null,
      }}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {message}
    </button>
  );
}

//  <MyButton message="Confirm" color="red" onClick={handleConfirm} />
