import React, { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";

const Whiteboard = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(5);
    const [drawing, setDrawing] = useState(false);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws/whiteboard");

        ws.onopen = () => console.log("Connected to WebSocket");
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "draw") {
                draw(data.x, data.y, data.color, data.width);
            } else if (data.type === "clear") {
                clearBoard(true);
            }
        };
        ws.onclose = () => console.log("Disconnected from WebSocket");

        setSocket(ws);

        const canvas = canvasRef.current;
        if (canvas) {
            ctxRef.current = canvas.getContext("2d");
        }

        return () => {
            ws.close();
        };
    }, []);

    const sendDrawingData = (x, y) => {
        if (socket) {
            const drawingData = { type: "draw", x, y, color, width: brushSize };
            socket.send(JSON.stringify(drawingData));
        }
    };

    const draw = (x, y, color, width) => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, width / 2, 0, 2 * Math.PI);
        ctx.fill();
    };

    const handleMouseDown = (event) => {
        setDrawing(true);
        handleMouseMove(event);
    };

    const handleMouseUp = () => setDrawing(false);

    const handleMouseMove = (event) => {
        if (!drawing) return;
        const { offsetX, offsetY } = event.nativeEvent;
        sendDrawingData(offsetX, offsetY);
        draw(offsetX, offsetY, color, brushSize);
    };

    const clearBoard = (fromServer = false) => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        if (!fromServer && socket) {
            socket.send(JSON.stringify({ type: "clear" }));
        }
    };

    const saveAsImage = () => {
        const canvas = canvasRef.current;
        canvas.toBlob((blob) => {
            saveAs(blob, "whiteboard.png");
        });
    };

    return (
        <div className="pt-4  text-white flex flex-col items-center">
            <h2 className=" font-bold mb-2 text-black font-sans text-2xl">Collaborative Whiteboard</h2>
            <canvas
                ref={canvasRef}
                width={1150}
                height={600}
                className="border border-gray-600 rounded bg-white"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            />
            <div className="mt-4 flex gap-3">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="border p-1" />
                <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-24" />
                <button onClick={() => clearBoard(false)} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Clear</button>
                <button onClick={saveAsImage} className="bg-green-500 px-3 py-1 rounded hover:bg-green-600">Save as Image</button>
            </div>
        </div>
    );
};

export default Whiteboard;
