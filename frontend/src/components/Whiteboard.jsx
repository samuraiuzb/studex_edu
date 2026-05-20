import { useRef, useState, useEffect } from 'react';

export default function Whiteboard({ onClose }) {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#6366f1'); // Default Indigo
    const [brushSize, setBrushSize] = useState(4);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Setup for high resolution displays (retina)
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const context = canvas.getContext('2d');
        context.scale(2, 2);
        context.lineCap = 'round';
        context.strokeStyle = color;
        context.lineWidth = brushSize;

        // Fill white background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, rect.width, rect.height);

        contextRef.current = context;
    }, []);

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = brushSize;
        }
    }, [color, brushSize]);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    // For touch devices
    const getTouchPos = (canvas, touchEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
            offsetX: touchEvent.touches[0].clientX - rect.left,
            offsetY: touchEvent.touches[0].clientY - rect.top
        };
    };

    const handleTouchStart = (e) => {
        e.preventDefault(); // Prevent scrolling
        const pos = getTouchPos(canvasRef.current, e);
        contextRef.current.beginPath();
        contextRef.current.moveTo(pos.offsetX, pos.offsetY);
        setIsDrawing(true);
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const pos = getTouchPos(canvasRef.current, e);
        contextRef.current.lineTo(pos.offsetX, pos.offsetY);
        contextRef.current.stroke();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        const rect = canvas.parentElement.getBoundingClientRect();
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, rect.width, rect.height);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 animate-slide-up">

                {/* Header Toolbar */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4 flex-wrap">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span>🖍️</span> Qoralama (Whiteboard)
                        </h3>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

                        {/* Colors */}
                        <div className="flex gap-2">
                            {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#1e293b', '#ffffff'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-6 h-6 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${color === c ? 'border-slate-400 scale-110 shadow-md' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                    title={c === '#ffffff' ? "O'chirgich" : "Rang"}
                                />
                            ))}
                        </div>

                        {/* Brush Size */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Qalinlik:</span>
                            <input
                                type="range"
                                min="1" max="20"
                                value={brushSize}
                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="w-24 accent-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={clearCanvas} className="text-sm px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-200 dark:hover:bg-rose-900/60 transition">
                            Tozalash
                        </button>
                        <button onClick={onClose} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                            ✖️
                        </button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative cursor-crosshair">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseUp={finishDrawing}
                        onMouseOut={finishDrawing}
                        onMouseMove={draw}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={finishDrawing}
                        onTouchMove={handleTouchMove}
                        className="touch-none bg-white shadow-inner"
                    />
                </div>
            </div>
        </div>
    );
}
