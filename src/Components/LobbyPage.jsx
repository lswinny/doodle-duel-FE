import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

export default function LobbyPage({ nickname, token, rooms, setRooms, avatar }) {
  const navigate = useNavigate();
  const safeRooms = Array.isArray(rooms) ? rooms : [];

  useEffect(() => {
    socket.emit("lobby:join");

    //socket.emit("lobby:get-rooms");

    function handleRoomsUpdated(data) {
      if (!Array.isArray(data)) return;
      setRooms([...new Set(data)]);
    }

    function handleRoomCreated(code, data) {
      console.log(data);
      const newCode = typeof code === "string" ? code : code?.roomCode;
      if (!newCode) {
        console.warn("roomCreated event received without a room code:", code);
        return;
      }
      setRooms((prev) => Array.from(new Set([...(prev || []), newCode])));

      navigate(`/room/${code}`, { state: { room: data } });
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
        <h1 className="screen__title">Doodle Duel!</h1>
      </header>

      <div className="screen__body">
        <p>Hi {nickname || "Player"}! Welcome to the Lobby!</p>
        {avatar && (
          <div className="avatar-circle" aria-hidden="true">
            <img
              src={avatar}
              alt="Your avatar"
              style={{ width: "150px", height: "150px"}}
            />
          </div>
        )}
        <p>Please create or join a room!</p>

        <button className="primary-button" onClick={handleCreateRoom}>
          Create room
        </button>

        {safeRooms.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h2>Available Rooms</h2>
            {rooms.map((code) => (
              <button
                key={code}
                className="secondary-button"
                onClick={() => {
                  navigate(`/room/${code}`);
                }}
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
