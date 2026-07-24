import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuthStore } from '#src/store/authStore';
import type { Role } from '#src/api/types';

interface PanelLayoutProps {
  children: ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  roles: Role[];
}

interface NavGroup {
  label: string;
  roles: Role[];
  items: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry;
}

/** ADMIN ve todo; CEDI y CONDUCTOR solo lo que la auditoría de permisos definió para su rol. */
const NAV_ENTRIES: NavEntry[] = [
  { to: '/panel', label: 'Panel', end: true, roles: ['ADMIN'] },
  { to: '/panel/entregas', label: 'Entregas', roles: ['ADMIN', 'CEDI'] },
  { to: '/panel/rutas', label: 'Rutas', roles: ['ADMIN', 'CEDI'] },
  { to: '/panel/facturacion', label: 'Facturación', roles: ['ADMIN', 'CEDI'] },
  {
    label: 'Datos maestros',
    roles: ['ADMIN'],
    items: [
      { to: '/panel/usuarios', label: 'Usuarios', roles: ['ADMIN'] },
      { to: '/panel/cedis', label: 'Droguerías', roles: ['ADMIN'] },
      { to: '/panel/usuarios?role=CONDUCTOR', label: 'Conductores', roles: ['ADMIN'] },
    ],
  },
  { to: '/panel/reportes', label: 'Reportes', roles: ['ADMIN'] },
  { to: '/panel/configuracion', label: 'Configuración', roles: ['ADMIN'] },
  { to: '/cdi', label: 'Verificación de planillas', roles: ['ADMIN', 'CEDI'] },
  { to: '/conductor', label: 'App Conductor', roles: ['ADMIN', 'CONDUCTOR'] },
  { to: '/panel/perfil', label: 'Mi perfil', roles: ['ADMIN', 'CEDI', 'CONDUCTOR'] },
];

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrador',
  CEDI: 'Droguería',
  CONDUCTOR: 'Conductor',
};

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

  const visibleEntries = NAV_ENTRIES.filter((entry) => (user ? entry.roles.includes(user.role) : false));

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
          {visibleEntries.map((entry) =>
            isNavGroup(entry) ? (
              <div key={entry.label} className="pt-2 first:pt-0">
                <p className="px-3.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">{entry.label}</p>
                {entry.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      clsx(
                        'block rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                        isActive ? 'bg-cold text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ) : (
              <NavLink
                key={entry.to}
                to={entry.to}
                end={entry.end}
                className={({ isActive }) =>
                  clsx(
                    'block rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-cold text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
                  )
                }
              >
                {entry.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-xs font-bold">
              {initials}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-[11px] text-white/40">{user ? ROLE_LABEL[user.role] : ''}</p>
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
