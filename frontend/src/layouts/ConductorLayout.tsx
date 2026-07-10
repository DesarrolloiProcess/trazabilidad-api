import type { ReactNode } from 'react';

interface ConductorLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ConductorLayout({ title, subtitle, children }: ConductorLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-navy px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))] text-white">
        <div className="flex items-center gap-2">
          <span className="seal h-3 w-3 bg-cold" aria-hidden="true" />
          <p className="font-display text-[11px] font-semibold uppercase tracking-widest text-white/50">FarmaTrack Conductor</p>
        </div>
        <h1 className="mt-1.5 font-display text-xl font-bold leading-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-white/60">{subtitle}</p>}
      </header>

      <main className="flex-1 px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{children}</main>
    </div>
  );
}
