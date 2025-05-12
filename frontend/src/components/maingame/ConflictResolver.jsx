export const ConflictResolver = ({ serverData, localData, onResolve }) => {
  const handleUseServer = () => onResolve(serverData);
  const handleUseLocal = () => onResolve(localData);

  return (
    <div className="conflict-modal">
      <h3>Version conflict detected!</h3>
      <button onClick={handleUseServer}>Use server version</button>
      <button onClick={handleUseLocal}>Keep local changes</button>
    </div>
  );
};
