import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PortalLayoutProps {
  children: ReactNode;
  wide?: boolean;
}

export function PortalLayout({ children, wide }: PortalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-5 py-14">
      <Link to="/portal" className="mb-10 flex items-center gap-2.5">
        <span className="seal h-8 w-8 bg-cold" aria-hidden="true" />
        <div className="text-left leading-tight">
          <p className="font-display text-lg font-bold tracking-tight text-navy">
            Farma<span className="text-cold">Track</span>
          </p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">Consulta de pedidos</p>
        </div>
      </Link>

      <div className={wide ? 'w-full max-w-3xl' : 'w-full max-w-sm'}>{children}</div>
    </div>
  );
}
