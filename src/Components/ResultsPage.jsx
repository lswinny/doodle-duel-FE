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
  
        <div className="screen__body">
          <p>Results screen placeholder – we’ll match our Figma next.</p>
        </div>
      </section>
    );
  }
  
  export default ResultsPage;
  