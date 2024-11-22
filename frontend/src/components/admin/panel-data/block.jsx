export default function Block({ number, title }) {
  return (
    <div className="block-window">
      <div className="block-number">{number}</div>
      <div className="block-title">{title}</div>
    </div>
  );
}
