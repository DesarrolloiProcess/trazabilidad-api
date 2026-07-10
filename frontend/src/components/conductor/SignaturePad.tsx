import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
}

export function SignaturePad({ onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);

  const getContext = () => canvasRef.current?.getContext('2d') ?? null;

  const point = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = getContext();
    const { x, y } = point(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = point(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F2A3D';
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasStroke) setHasStroke(true);
  };

  const finishStroke = () => {
    drawing.current = false;
    if (canvasRef.current) onChange(canvasRef.current.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
    onChange(null);
  };

  return (
    <div>
      <div className="relative rounded-lg border-2 border-dashed border-slate-300 bg-white">
        <canvas
          ref={canvasRef}
          width={320}
          height={130}
          className="h-[130px] w-full touch-none rounded-lg"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerLeave={() => drawing.current && finishStroke()}
        />
        {!hasStroke && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Toca para firmar
          </p>
        )}
      </div>
      {hasStroke && (
        <button type="button" onClick={clear} className="mt-1.5 text-xs font-semibold text-cold">
          Borrar firma
        </button>
      )}
    </div>
  );
}
