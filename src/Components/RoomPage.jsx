import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";

function RoomPage({ nickname, token }) {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [players, setPlayers] = useState({});
  const [hostId, setHostId] = useState(null);

  useEffect(() => {
    socket.on("player-list", ({ players, hostId }) => {
      setPlayers(players);
      setHostId(hostId);
    });

    socket.on("roomClosed", ({ roomCode }) => {
      alert(`Room ${roomCode} closed because the host left.`);
      navigate("/lobby");
    });

    return () => {
      socket.off("player-list");
      socket.off("roomClosed");
    };
  }, [navigate]);

  function handleStartGame() {
    navigate("/canvas");
  }

  return (
    <section className="screen">
      <header className="screen__header">
        <h1 className="screen__title">Room {roomCode || "…"}</h1>
      </header>

      <div className="screen__body">
        <p>Players in this room:</p>
        <ul>
          {Object.entries(players).map(([id, { nickname }]) => (
            <li key={id}>
              {nickname}
              {id === socket.id ? " (You)" : ""}
              {id === hostId ? " (Host)" : ""}
            </li>
          ))}
        </ul>

        <button className="primary-button" onClick={handleStartGame}>
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