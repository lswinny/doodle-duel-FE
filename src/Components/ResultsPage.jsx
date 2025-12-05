import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";

function ResultsPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [results, setResults] = useState({});

  useEffect(() => {
    socket.emit("get-room-data", { roomCode });

    function handleRoomData(roomInfo) {
      if (!roomInfo) {
        alert("Room no longer exists");
        navigate("/lobby");
        return;
      }
      setRoom(roomInfo);
    }

    socket.on("room:data", handleRoomData);
    return () => socket.off("room:data", handleRoomData);
  }, [roomCode, navigate]);

  useEffect(() => {
    function handleStart(data) {
      setResults({});
      navigate(`/canvas/${roomCode}`, { state: data });
    }
  }, [roomCode, navigate]);

  useEffect(() => {
    function handleRoomClosed() {
      alert("The host has left. Returning to lobby...");
      navigate("/lobby");
    }

    socket.on("roomClosed", handleRoomClosed);
    return () => socket.off("roomClosed", handleRoomClosed);
  }, [navigate]);

  useEffect(() => {
    function handleResults(data) {
      console.log("data: ", data);
      setResults(data);
    }

    socket.on("round-results", handleResults);
    return () => socket.off("round-results", handleResults);
  }, []);

  if (!room) return <p>Loading results...</p>;

  return (
    <section className="screen">
      <header className="screen__header">
        <h1 className="screen__title">Doodle Duel!</h1>
      </header>

      <div className="results-container">
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Round Results
        </h2>

        <div className="results-images">
          {Object.entries(room.players).map(([socketId, player]) => {
            const scoreObj = results.scores?.find(
              (s) => s.playerName === player.nickname
            );
            const score = scoreObj ? `${Math.round(scoreObj.score)}%` : "Pending…"; // AI score here
            const url = scoreObj ? scoreObj.image : "Pending...";

            return (
              <div className="results-player" key={socketId}>
                {/* Avatar */}
                <div className="results-avatar">
                  <img
                    src={player.avatar || "/default-avatar.png"}
                    alt={`${player.nickname}'s avatar`}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                {/* Drawing image placeholder */}
                <div className="results-image-placeholder">
                  <img
                    src={"data:image/png;base64," + url}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>

                {/* Player name */}
                <p className="results-player-name">{player.nickname}</p>

                {/* AI Score — per player */}
                <p className="results-player-score">Score: {score}</p>
              </div>
            );
          })}
        </div>
        <div
          className="nav-buttons"
          style={{ marginTop: "2rem", textAlign: "center" }}
        >
          <button
            style={{ marginRight: "1rem" }}
            onClick={() => {
              socket.emit("quit-room", { roomCode });
              navigate("/lobby");
            }}
          >
            Quit
          </button>
          <button
            style={{ marginLeft: "1rem" }}
            onClick={() => {
              socket.emit("next-round", { roomCode });
              navigate(`/canvas/${roomCode}`);
            }}
          >
            Next Round
          </button>
        </div>
      </div>
    </section>
  );
}

export default ResultsPage;
