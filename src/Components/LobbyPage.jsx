import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

export default function LobbyPage({ nickname, token, roomCode, setRoomCode }) {
  const navigate = useNavigate();

  useEffect(() => {
    function handleRoomCreated(data) {
      const newCode = typeof data === "string" ? data : data?.roomCode;

      if (!newCode) {
        console.warn("roomCreated event received without a room code:", data);
        return;
      }

      console.log("Room created with code:", newCode);
      setRoomCode(newCode);  
      navigate("/room");       
    }

    socket.on("roomCreated", handleRoomCreated);

    return () => {
      socket.off("roomCreated", handleRoomCreated);
    };
  }, [navigate, setRoomCode]);

  function handleCreateRoom() {
    if (!token) {
      console.warn("No auth token yet; cannot create room.");
      return;
    }

    socket.emit("create-room", { token });
  }

  return (
    <section className="screen">
      <header className="screen__header">
        <h1 className="screen__title">Lobby</h1>
      </header>

      <div className="screen__body">
        <p>Hi {nickname || "Player"}! Lobby coming soon…</p>

        <button className="primary-button" onClick={handleCreateRoom}>
          Create room
        </button>

        {roomCode && (
          <p style={{ marginTop: "1rem" }}>
            Current room code: <strong>{roomCode}</strong>
          </p>
        )}
      </div>
    </section>
  );
}
