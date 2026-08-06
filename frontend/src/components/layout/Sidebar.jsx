import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Factory, ShoppingCart, Users, Wheat, BarChart3 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/inventory', label: 'Hammadde & Stok', icon: Package },
  { to: '/production', label: 'Üretim Planlama', icon: Factory },
  { to: '/orders', label: 'B2B Siparişler', icon: ShoppingCart },
  { to: '/reports', label: 'Raporlar', icon: BarChart3 },
];

const ADMIN_NAV_ITEMS = [{ to: '/users', label: 'Kullanıcılar', icon: Users }];

const linkClasses = ({ isActive }) =>
  `group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-brand-primary text-white shadow-soft-sm'
      : 'text-brand-primary/80 hover:translate-x-0.5 hover:bg-brand-primary/8 hover:text-brand-primary'
  }`;

const Sidebar = () => {
  const { user } = useAuth();
  const items = user?.role === 'admin' ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  return (
    <aside className="hidden w-64 shrink-0 bg-white/70 shadow-soft-lg backdrop-blur-md md:block">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-soft-sm"
          style={{ background: 'linear-gradient(135deg, #0f2438 0%, #0f2438 60%, #b7ab8c 100%)' }}
        >
          <Wheat size={18} />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-primary/60">Gıda Üretim</p>
          <p className="text-base font-bold leading-tight text-brand-primary">Kontrol Sistemi</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={linkClasses}>
              <Icon size={18} className="shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
