import { useRef, useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import socket from "../socket";

function Canvas({ nickname, token }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { roomCode } = useParams();

  const [room, setRoom] = useState(location.state?.room || null);
  const [mySocketId, setMySocketId] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [prev, setPrev] = useState(null);
  const [timer, setTimer] = useState(30);
  const [started, setStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

useEffect(() => {
  if (socket.connected) setMySocketId(socket.id);
  const onConnect = () => setMySocketId(socket.id);
  socket.on("connect", onConnect);
  return () => socket.off("connect", onConnect);
}, []);

  useEffect(() => {
    if (room) return;
    socket.emit("get-room-data", { roomCode });

    function handleRoomData(roomInfo) {
      if (!roomInfo) {
        alert("Room data unavailable. Returning to lobby...");
        navigate("/lobby");
        return;
      }
      setRoom(roomInfo);
    }
    socket.on("room:data", handleRoomData);
    return () => socket.off("room:data", handleRoomData);
  }, [roomCode, navigate]);

  useEffect(() => {
    if (!started || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.lineCap = "round";
    ctxRef.current = ctx;
  }, [started]);

  //Replaced the previous timer useEffect with the below, now the backend will handle countdown (to fix sync issue)
  useEffect(() => {
    function handleRoundStart({ duration }) {
      setStarted(true);
      setTimer(duration);
    }
    function handleCountdown({ timeLeft }) {
      setTimer(timeLeft);
    }
    socket.on("round:start", handleRoundStart);
    socket.on("round:countdown", handleCountdown);
    return () => {
      socket.off("round:start", handleRoundStart);
      socket.off("round:countdown", handleCountdown);
    };
  }, []);

  if (!room) {
    return <p>Loading room...</p>;
  }

  // ---- Drawing functions ----
  function drawLine(x1, y1, x2, y2, color = "black") {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

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

  // Convert canvas → PNG Blob
  function canvasToPngBlob(canvas) {
    console.log("converting");
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) reject(new Error("Canvas.toBlob returned null"));
          else resolve(blob);
        },
        "image/png",
        0.92
      );
    });
  }

  // Submit drawing
  async function handleSubmitDrawing() {
    setError("");

    const canvas = canvasRef.current;
    if (!canvas) {
      setError("Canvas is not ready yet.");
      return;
    }

    if (!roomCode) {
      setError("No room code available – cannot submit drawing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const pngBlob = await canvasToPngBlob(canvas);

      const formData = new FormData();
      formData.append("image", pngBlob, "drawing.png");
      formData.append("roomCode", roomCode);
      if (token) formData.append("token", token);
      if (nickname) formData.append("nickname", nickname);

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
        room.host === mySocketId ? (
          <button
            onClick={() => {
              socket.emit("start-game", { roomCode, token, duration: 30 });
            }}
          >
            Begin Round
          </button>
        ) : (
          <p>Waiting for host to start the round…</p>
        )
      ) : (
        <>
          <h3>⏳ Time left: {timer} seconds</h3>
          <section className="screen">
            <header className="screen__header">
              <h1 className="screen__title">Canvas</h1>
              {roomCode && <p>Room: {roomCode}</p>}
            </header>

            <div className="screen__body">
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
                  <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Canvas;
