import { useRef, useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import socket from "../socket";

function Canvas() {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const {roomCode} = useParams();

    const [room, setRoom] = useState(location.state?.room || null);

    const [drawing, setDrawing] = useState(false);
    const [prev, setPrev] = useState(null);

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

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 800;
        canvas.height = 500;
        const ctx = canvas.getContext("2d");
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.linecap = "round";
        

        ctxRef.current = ctx;
    }, [room]);


    console.log("Players: ", room.players);
    console.log("Host: ", room.host);

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

        setPrev({x,y});
    }

    return (
        <canvas
        ref={canvasRef}
        style={{border: "1px solid black", background: "white"}}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        />
    );
}

export default Canvas;
