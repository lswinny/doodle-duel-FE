import { useRef, useEffect, useState } from "react";

function Canvas() {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);

    const [drawing, setDrawing] = useState(false);
    const [prev, setPrev] = useState(null);
    const [predictedCategory, setPredictedCategory] = useState("");
    const [strokes, setStrokes] = useState([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 800;
        canvas.height = 500;
        const ctx = canvas.getContext("2d");
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.lineCap = "round";
        

        ctxRef.current = ctx;
    }, []);

    function drawLine(x1, y1, x2, y2, color = "black"){
        const ctx = ctxRef.current;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
    }

    function handleMouseDown(e){
        setDrawing(true);
        setPrev({x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY});
        setStrokes(prev => [...prev, [{x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY}]]);
    }

    function handleMouseUp(){
        setDrawing(false);
        setPrev(null);
    }

    function handleMouseMove(e){
        if (!drawing) return;

        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        drawLine(prev.x, prev.y, x, y);

        setStrokes(prev => {
        const newStrokes = [...prev];
        newStrokes[newStrokes.length - 1].push({x, y});
        return newStrokes;
        });

        setPrev({x,y});
    }

    async function handleSubmit(){
        const dataUrl = canvasRef.current.toDataURL("image/png");

        try {
            const response = await fetch("http://127.0.0.1:8000/api/submit", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({image: dataUrl, strokes})
            });
            const result = await response.json();
            console.log(result)
            setPredictedCategory(result.best_category);
        }
        catch(err){
            console.error("Error submitting drawing:", err);
        }
    }

    return (
        <>
        <canvas
        ref={canvasRef}
        style={{border: "1px solid black", background: "white"}}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        />
        <div>
        <button onClick={handleSubmit}>SUBMIT</button>
        {predictedCategory && <p>Predicted Category: {predictedCategory}</p>}
        </div>
        </>
    );
}

export default Canvas;
