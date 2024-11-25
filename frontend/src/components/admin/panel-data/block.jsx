export default function Block({ number = "0", title }) {
  return (
    <div className="block">
      <div className="block-number">{number}</div>
      <div className="block-title">{title}</div>
    </div>
  );
}
