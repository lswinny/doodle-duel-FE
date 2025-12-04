import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";

function RoomPage({ nickname, token, avatar }) {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [players, setPlayers] = useState({});
  const [hostId, setHostId] = useState(null);

  useEffect(() => {
    socket.emit("join-room", { roomCode, nickname, token, avatar });

    const handleRoomData = (roomInfo) => {
      setPlayers(roomInfo.players);
      setHostId(roomInfo.host);
    };

    const handleRoomClosed = ({ roomCode }) => {
      alert(`Room ${roomCode} closed because the host left.`);
      navigate("/lobby");
    };

    const handleGameStarted = ({ roomCode, roomData }) => {
      navigate(`/canvas/${roomCode}`, { state: { room: roomData } });
    };

    socket.on("room:data", handleRoomData);
    socket.on("roomClosed", handleRoomClosed);
    socket.on("game-started", handleGameStarted);

    return () => {
      socket.off("room:data", handleRoomData);
      socket.off("roomClosed", handleRoomClosed);
      socket.off("game-started", handleGameStarted);
    };
  }, [roomCode, nickname, token, navigate, avatar]);

  console.log("Room code:", roomCode);
  //console.log("Host ID:", room.host);

  console.log({ players });
  return (
    <section className="screen">
      <header className="screen__header">
        <h1 className="screen__title">Doodle Duel!</h1>
      </header>

      <div className="screen__body">
        <p>Players in this room:</p>
        <ul className="player-list">
          {Object.entries(players).map(([id, { nickname, avatar }]) => (
            <li
              key={id}
              className="player-card"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              {avatar && (
                <img
                  src={avatar}
                  alt={`${nickname}'s avatar`}
                  style={{ width: "50px", height: "50px" }}
                />
              )}
              <span>
                {nickname}
                {id === socket.id ? " (You)" : ""}
                {id === hostId ? " (Host)" : ""}
              </span>
            </li>
          ))}
        </ul>

        <button
          className="primary-button"
          onClick={() =>
            socket.emit("start-game", {
              roomCode,
              token,
            })
          }
          disabled={socket.id !== hostId}
        >
          Start Game
        </button>

        <button
          className="primary-button"
          style={{ marginTop: "1rem" }}
          onClick={() => {
            socket.emit("quit-room", { roomCode });
            navigate("/lobby");
          }}
        >
          Quit Room
        </button>

        {socket.id !== hostId && <p>Waiting for host to start the game...</p>}

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
