import { useNavigate, useParams } from "react-router-dom";

function RoomPage({ nickname, token }) {
  const navigate = useNavigate();
  const {roomCode} = useParams();

  function handleStartGame() {
    navigate("/canvas");
  }

  return (
    <section className="screen">
      <header className="screen__header">
        <h1 className="screen__title">
          Room {roomCode || "…"}
        </h1>
      </header>

      <div className="screen__body">
        <p>Players in this room (placeholder):</p>
        <ul>
          <li>{nickname || "You"} (Host)</li>
          <li>Player 2</li>
          <li>Player 3</li>
        </ul>

        <button
          className="primary-button"
          onClick={handleStartGame}
        >
          Start Game
        </button>

        {roomCode && (
          <p style={{ marginTop: "1rem" }}>
            Share this code so other players can join:{" "}
            <strong>{roomCode}</strong>
          </p>
        )}
      </div>
    </section>
  );
}


export default RoomPage;
