import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import socket from "../socket";

function RoomPage({ nickname, token }) {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [players, setPlayers] = useState({});
  const [hostId, setHostId] = useState(null);
  const location = useLocation();
  const room = location.state?.room;

  useEffect(() => {
    socket.emit('join-room', ({roomCode, nickname, token}))
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

  console.log("Room code:", roomCode);
  console.log("Room data:", room);

  function handleStartGame() {
    navigate("/canvas");
  }
  console.log({players})
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
              Nickname: {nickname}
              Socket ID: {id === socket.id ? " (You)" : ""}
              Host ID: {id === hostId ? " (Host)" : ""}
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