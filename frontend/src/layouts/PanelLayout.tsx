import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuthStore } from '#src/store/authStore';

interface PanelLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { to: '/panel', label: 'Panel', end: true },
  { to: '/panel/entregas', label: 'Entregas' },
  { to: '/panel/rutas', label: 'Rutas' },
  { to: '/panel/mapa', label: 'Mapa' },
  { to: '/panel/facturacion', label: 'Facturación' },
  { to: '/panel/cedis', label: 'CEDIs' },
  { to: '/panel/usuarios', label: 'Usuarios' },
  { to: '/panel/reportes', label: 'Reportes' },
  { to: '/panel/configuracion', label: 'Configuración' },
  { to: '/panel/perfil', label: 'Mi perfil' },
];

export function PanelLayout({ children }: PanelLayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-60 shrink-0 flex-col bg-navy-dark text-white">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-6">
          <span className="seal h-7 w-7 bg-cold" aria-hidden="true" />
          <div className="leading-tight">
            <p className="font-display text-base font-bold tracking-tight">
              Farma<span className="text-cold">Track</span>
            </p>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Panel operativo</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'block rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-cold text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-xs font-bold">
              {initials}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-[11px] text-white/40">{user?.role === 'ADMIN' ? 'Administrador' : 'CEDI'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
