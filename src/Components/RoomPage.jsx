import { useNavigate } from "react-router-dom";

function RoomPage({ nickname }) {
  const navigate = useNavigate();

  function handleStartGame() {
    navigate("/canvas");
  }

  return (
    <section className="screen">
      <header className="screen__header">
        <h1 className="screen__title">Room ABC123</h1>
      </header>

      <div className="screen__body">
        <p>Players in this room (placeholder):</p>
        <ul>
          <li>{nickname || "You"} (Host)</li>
          <li>Player 2</li>
          <li>Player 3</li>
        </ul>

        <button className="primary-button" onClick={handleStartGame}>
          Start Game
        </button>
      </div>
    </section>
  );
}

export default RoomPage;
