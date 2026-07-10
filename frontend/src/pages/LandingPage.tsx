import { Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '#src/store/authStore';

export function LandingPage() {
  const { user } = useAuthStore();

  if (user?.role === 'CONDUCTOR') return <Navigate to="/conductor" replace />;
  if (user?.role === 'ADMIN' || user?.role === 'CEDI') return <Navigate to="/panel" replace />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-navy px-6 text-white">
      <div className="flex items-center gap-3">
        <span className="seal h-10 w-10 bg-cold" aria-hidden="true" />
        <div className="text-left leading-tight">
          <p className="font-display text-2xl font-bold tracking-tight">
            Farma<span className="text-cold">Track</span>
          </p>
          <p className="text-xs uppercase tracking-widest text-white/40">Trazabilidad de entregas farmacéuticas</p>
        </div>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        <Link
          to="/login"
          className="rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-colors hover:border-cold hover:bg-white/10"
        >
          <p className="font-display text-lg font-semibold">Acceso interno</p>
          <p className="mt-1.5 text-sm text-white/60">CEDI, administración y conductores</p>
        </Link>
        <Link
          to="/portal"
          className="rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-colors hover:border-cold hover:bg-white/10"
        >
          <p className="font-display text-lg font-semibold">Consultar mi pedido</p>
          <p className="mt-1.5 text-sm text-white/60">Sin necesidad de cuenta — solo tu guía</p>
        </Link>
      </div>
    </div>
  );
}
