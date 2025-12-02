import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";

function ResultsPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);

  useEffect(() => {
    socket.emit("get-room-data", {roomCode});

    function handleRoomData(roomInfo){
      if (!roomInfo){
        alert("Room no longer exists");
        navigate("/lobby");
        return;
      }
      setRoom(roomInfo);
    }

    socket.on("room:data", handleRoomData);
    return () => socket.off("room:data", handleRoomData);
  }, [roomCode, navigate]);

  console.log(room)

  if (!room) return <p>Loading results...</p>;

    return (
        <section className="screen">
    <header className="screen__header">
      <h1 className="screen__title">Results for Room: {roomCode}</h1>
    </header>

    <div className="results-container">

      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Round Results
      </h2>

      <div className="results-images">
        {Object.entries(room.players).map(([socketId, player]) => {
          const score = room.scores?.[socketId] ?? "Pending…"; // AI score here

          return (
            <div className="results-player" key={socketId}>
              
              {/* Drawing image placeholder */}
              <div className="results-image-placeholder">
                {/* For real images later:
                <img
                  src={room.submissions[socketId]}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
                */}
              </div>

              {/* Player name */}
              <p className="results-player-name">{player.nickname}</p>

              {/* AI Score — per player */}
              <p className="results-player-score">
                Score: {score}
              </p>

            </div>
          );
        })}
      </div>

    </div>
  </section>
    );
  }
  
  export default ResultsPage;
  