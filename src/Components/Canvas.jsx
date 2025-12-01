import { useRef, useEffect, useState } from "react";


import { useLocation, useParams, useNavigate } from "react-router-dom";
import socket from "../socket";

function Canvas({ nickname, token }) {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const {roomCode} = useParams();

    const [room, setRoom] = useState(location.state?.room || null);

    const [drawing, setDrawing] = useState(false);
    const [prev, setPrev] = useState(null);
    const [timer, setTimer] = useState(30);
    const [started, setStarted] = useState(false);


  useEffect(() => {
    if (!started || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.linecap = "round";
    ctxRef.current = ctx;
  }, [started,room]);

  useEffect(() => {
    if (!started) return;
    if (timer <= 0) {
      console.log(
        "Timer finished - replace this console.log with handleSubmit function invocation once function has been created"
      );
      return;
    });
      
    // added in this branch: basic UI state for upload
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // added in this branch: Get roomCode from navigation state
  const location = useLocation();
  const roomCode = location.state?.roomCode || "";

    useEffect(() => {
        if (room) return;

        socket.emit("get-room-data", {roomCode});

        function handleRoomData(roomInfo){
            if(!roomInfo){
                alert("Room data unavailable. Returning to lobby...");
                navigate("/lobby");
                return;
            }
            setRoom(roomInfo);
        }

        socket.on("room:data", handleRoomData);

        return () => {
            socket.off("room:data", handleRoomData);
        }
    }, [roomCode,navigate])

    if(!room){
        return <p>Loading room...</p>
    }

    console.log("Players: ", room.players);
    console.log("Host: ", room.host);

    function drawLine(x1, y1, x2, y2, color = "black"){
        const ctx = ctxRef.current;
        if (!ctx) return;

        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();

    }
    const timerId = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          console.log("Timer finished");
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [started, timer]);

  function handleMouseDown(e) {
    setDrawing(true);
    setPrev({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  }

  function handleMouseUp() {
    setDrawing(false);
    setPrev(null);
  }

  function handleMouseMove(e) {
    if (!drawing) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    drawLine(prev.x, prev.y, x, y);

    setPrev({ x, y });
  }

  //handleSubmit async function goes here... Sirat is looking into this


    function canvasToPngBlob(canvas) {
        return new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Canvas.toBlob returned null"));
              } else {
                resolve(blob);
              }
            },
            "image/png", // mime type
            0.92         // quality (ignored for PNG but fine to leave)
          );
        });
      }
    
      // NEW: submitting drawing to Express server ----
      async function handleSubmitDrawing() {
        setError("");
    
        const canvas = canvasRef.current;
        if (!canvas) {
          setError("Canvas is not ready yet.");
          return;
        }
    
        if (!roomCode) {
          // we *can* relax this later if anybody want,
          // but for now it's helpful feedback.
          setError("No room code available – cannot submit drawing.");
          return;
        }
    
        setIsSubmitting(true);
    
        try {
          // Turning canvas contents into a PNG blob
          const pngBlob = await canvasToPngBlob(canvas);
    
          // Building form data to send to Express
          const formData = new FormData();
          formData.append("image", pngBlob, "drawing.png");
          formData.append("roomCode", roomCode);
          if (token) formData.append("token", token);
          if (nickname) formData.append("nickname", nickname);
    
          // POST to Express API
          //  have to  Adjust URL if our backend uses another path.
          const res = await fetch("http://localhost:3000/api/drawings", {
            method: "POST",
            body: formData,
          });
    
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Upload failed: ${res.status} ${text}`);
          }
    
          const data = await res.json().catch(() => null);
          console.log("Drawing uploaded successfully:", data);
    
          // Here we could navigate to a "waiting for results" screen
          // or just show a success message.
          // e.g. alert("Drawing submitted!");
        } catch (err) {
          console.error(err);
          setError(err.message || "Something went wrong while submitting.");
        } finally {
          setIsSubmitting(false);
        }
      }
    
      return (
        <div>
  {!started ? (
    <button
      onClick={() => {
        setTimer(30);
        setStarted(true);
      }}
    >
      Begin Round
    </button>
  ) : (
    <>
      <section className="screen">
        <header className="screen__header">
          <h1 className="screen__title">Canvas</h1>
          {roomCode && <p>Room: {roomCode}</p>}
        </header>

        <div className="screen__body">
          {/* SINGLE CANVAS */}
          <canvas
            ref={canvasRef}
            style={{
              border: "1px solid black",
              background: "white",
              width: "800px",
              height: "500px",
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          />

          {/* Submit button + status */}
          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              onClick={handleSubmitDrawing}
              disabled={isSubmitting}
              className="primary-button"
            >
              {isSubmitting ? "Sending drawing..." : "Submit drawing"}
            </button>

            {error && (
              <p style={{ color: "red", marginTop: "0.5rem" }}>
                {error}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Timer */}
      <h3>⏳ Time left: {timer} seconds</h3>
    </>
  )}
</div>
      );
}

export default Canvas;
