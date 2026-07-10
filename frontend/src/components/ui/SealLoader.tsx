interface SealLoaderProps {
  label?: string;
}

export function SealLoader({ label = 'Cargando…' }: SealLoaderProps) {
  return (
    <div data-testid="seal-loader" className="flex flex-col items-center justify-center gap-3 py-10 text-slate-500">
      <div className="relative h-10 w-10">
        <span className="seal absolute inset-0 bg-cold/25 motion-safe:animate-ping motion-reduce:animate-pulse" aria-hidden="true" />
        <span className="seal absolute inset-[7px] bg-cold" aria-hidden="true" />
      </div>
      <p className="font-display text-sm uppercase tracking-wide">{label}</p>
    </div>
  );
}
