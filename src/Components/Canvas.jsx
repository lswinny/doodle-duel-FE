import { useRef, useEffect, useState } from "react";

function Canvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

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
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (timer <= 0) {
      console.log(
        "Timer finished - replace this console.log with handleSubmit function invocation once function has been created"
      );
      return;
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

  //handleSubmit async function goes here... Sirat is looking into this

  return (
    <div>
      {!started ? (
        <button
          onClick={() => {
            setTimer(30);
            setStarted(true);
          }}
        > Begin Round </button>
      ) : (
        <>
          <h3>⏳ Time left: {timer} seconds</h3>
          <canvas
            ref={canvasRef}
            style={{
                border: "1px solid black",
                background: "white",
                width: "800px",
                height: "500px"
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          />
        </>
      )}
    </div>
  );
}

export default Canvas;
