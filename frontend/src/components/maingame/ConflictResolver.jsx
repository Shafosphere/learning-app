export const ConflictResolver = ({ serverData, localData, onResolve }) => {
  const handleUseServer = () => onResolve(serverData);
  const handleUseLocal = () => onResolve(localData);

  return (
    <div className="conflict-modal">
      <h3>Wykryto konflikt wersji!</h3>
      <button onClick={handleUseServer}>Użyj wersji z serwera</button>
      <button onClick={handleUseLocal}>Zachowaj lokalne zmiany</button>
    </div>
  );
};
