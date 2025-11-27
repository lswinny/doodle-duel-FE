import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

export default function LobbyPage({ nickname, token, rooms, setRooms }) {
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("lobby:join");

    socket.emit("lobby:get-rooms");

    function handleRoomsUpdated(data){
      setRooms(data);
    }

    function handleRoomCreated(data) {
      const newCode = typeof data === "string" ? data : data?.roomCode;
      if (!newCode) {
        console.warn("roomCreated event received without a room code:", data);
        return;
      }
      setRooms(prev => [...prev, newCode]);
    }

    socket.on("lobby:rooms-updated", handleRoomsUpdated);
    socket.on("roomCreated", handleRoomCreated);

    return () => {
      socket.off("lobby:rooms-updated", handleRoomsUpdated);
      socket.off("roomCreated", handleRoomCreated);
    };
  }, [setRooms]);

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

        {/* {roomCode && (
          <p style={{ marginTop: "1rem" }}>
            Current room code: <strong>{roomCode}</strong>
          </p>
        )} */}

        {rooms.length > 0 && (
  <div style={{ marginTop: "1rem" }}>
    <h2>Available Rooms</h2>
    {rooms.map(code => (
      <button
        key={code}
        className="secondary-button"
        onClick={() => navigate(`/room/${code}`)}
      >
        Join room {code}
      </button>
    ))}
  </div>
)}
      </div>
    </section>
  );
}
