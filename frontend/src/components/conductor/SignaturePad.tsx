import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
}

export function SignaturePad({ onChange }: SignaturePadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);

  // El canvas se dibuja a la resolucion interna real de su caja (no un tamano fijo arbitrario),
  // para que la coordenada del dedo/mouse coincida exactamente con donde se traza la linea —
  // un desfase aqui es lo que produce trazos que aparecen en un punto distinto al que se tocó.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const { width, height } = container.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext('2d');
    ctx?.scale(ratio, ratio);
  }, []);

  const getContext = () => canvasRef.current?.getContext('2d') ?? null;

  const point = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (hasStroke) return;
    drawing.current = true;
    const ctx = getContext();
    const { x, y } = point(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || hasStroke) return;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = point(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F2A3D';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const finishStroke = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (canvasRef.current) {
      setHasStroke(true);
      onChange(canvasRef.current.toDataURL('image/png'));
    }
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
      <div
        ref={containerRef}
        className={`relative rounded-lg border-2 bg-white ${hasStroke ? 'border-solid border-dispensed/40 bg-dispensed/5' : 'border-dashed border-slate-300'}`}
      >
        <canvas
          ref={canvasRef}
          className={`h-[130px] w-full rounded-lg ${hasStroke ? 'touch-auto' : 'touch-none'}`}
          style={{ pointerEvents: hasStroke ? 'none' : 'auto' }}
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
        {hasStroke && (
          <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-dispensed/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-dispensed">
            Firma capturada
          </span>
        )}
      </div>
      {hasStroke && (
        <button type="button" onClick={clear} className="mt-1.5 text-xs font-semibold text-cold">
          Borrar y firmar de nuevo
        </button>
      )}
    </div>
  );
}
