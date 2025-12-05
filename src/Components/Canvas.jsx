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
  const [preCountdown, setPreCountdown] = useState(null);
  const [prompt, setPrompt] = useState("");
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

  function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  useEffect(() => {
    function handlePreCountdown({ count, prompt }) {
      setPrompt(capitalizeFirstLetter(prompt));
      setPreCountdown(count);
    }
    socket.on("round:precountdown", handlePreCountdown);
    return () => socket.off("round:precountdown", handlePreCountdown);
  }, []);

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

  useEffect(() => {
    function handleRoundStart({ duration, prompt }) {
      setStarted(true);
      setTimer(duration);
      setPrompt(capitalizeFirstLetter(prompt));
      setPreCountdown(null);
    }
    socket.on("round:start", handleRoundStart);
    return () => {
      socket.off("round:start", handleRoundStart);
    };
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else if (timer === 0 && !isSubmitting) {
      console.log("⏰ Timer finished — auto submitting drawing");
      handleSubmitDrawing();
    }
  }, [timer]);

  if (!room) {
    return <p>Loading room...</p>;
  }

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

  async function handleSubmitDrawing() {
    if (isSubmitting) return;
    setIsSubmitting(true);

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
      formData.append("socketId", socket.id);
      if (token) formData.append("token", token);
      if (nickname) formData.append("nickname", nickname);

      const res = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => null);
      console.log("Drawing uploaded successfully:", data);
      navigate(`/results/${roomCode}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="game-layout">
      {/* Header always visible */}
      <header className="screen__header">
        <h1 className="screen__title" data-text="Doodle Duel!">
          DOODLE DUEL!
        </h1>
        {prompt && (
          <p id="prompt-text">
            Prompt: <span>{prompt}</span>
          </p>
        )}
        {started && preCountdown === null && (
          <p className="canvas-timer">
            ⏳ Time left: <span>{timer}</span> seconds
          </p>
        )}
      </header>

      {/* Conditional body below header */}
      {preCountdown !== null && preCountdown >= 0 ? (
        <section className="screen">
          <div className="screen__body canvas-layout">
            {prompt && (
              <h2 className="canvas-prompt">
                Prompt: <span>{prompt}</span>
              </h2>
            )}
            <h1 className="canvas-countdown">{preCountdown}</h1>
          </div>
        </section>
      ) : !started ? (
        <section className="screen">
          <div className="screen__body canvas-layout">
            <p className="canvas-waiting">Waiting for round to begin…</p>
          </div>
        </section>
      ) : (
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="drawing-canvas"
            width={800}
            height={500}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          />
        </div>
      )}
    </div>
  );
}

export default Canvas;
