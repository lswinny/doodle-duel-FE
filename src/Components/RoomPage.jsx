import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";

function RoomPage({ nickname, token }) {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [players, setPlayers] = useState({});
  const [hostId, setHostId] = useState(null);

  useEffect(() => {
    socket.emit('join-room', {roomCode, nickname, token})
    socket.on("room:data", (roomInfo) => {
      setPlayers(roomInfo.players);
      setHostId(roomInfo.host);
    });

    socket.on("roomClosed", ({ roomCode }) => {
      alert(`Room ${roomCode} closed because the host left.`);
      navigate("/lobby");
    });

    socket.on("game-started", ({roomCode, roomData}) => {
      navigate(`/canvas/${roomCode}`, {state: {room: roomData}})
    })

    return () => {
      socket.off("room:data");
      socket.off("roomClosed");
      socket.off("game-started")
    };
  }, []);

  console.log("Room code:", roomCode);
  //console.log("Host ID:", room.host);

  console.log({players})
  return (
    <section className="screen">
      <header className="screen__header">
        <h1 className="screen__title">Doodle Duel!</h1>
      </header>

      <div className="screen__body">
        <p>Players in this room:</p>
        <ul>
          {Object.entries(players).map(([id, { nickname }]) => (
            <li key={id}>
              Player: {nickname}
              {id === socket.id ? " (You)" : ""}
              {id === hostId ? " (Host)" : ""}
            </li>
          ))}
        </ul>

        <button className="primary-button" onClick={() => socket.emit("start-game", {
          roomCode, token
        })}
          disabled={socket.id !== hostId}>
          Start Game
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