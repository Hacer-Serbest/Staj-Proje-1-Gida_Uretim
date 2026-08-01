import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Panel' },
  { to: '/inventory', label: 'Hammadde & Stok' },
  { to: '/production', label: 'Üretim Planlama' },
  { to: '/orders', label: 'B2B Siparişler' },
];

const ADMIN_NAV_ITEMS = [{ to: '/users', label: 'Kullanıcılar' }];

const linkClasses = ({ isActive }) =>
  `block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-primary text-white' : 'text-brand-primary hover:bg-brand-primary/10'
  }`;

const Sidebar = () => {
  const { user } = useAuth();
  const items = user?.role === 'admin' ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-brand-primary/15 bg-white/60 backdrop-blur-sm md:block">
      <div className="px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary/70">Gıda Üretim</p>
        <p className="text-lg font-bold text-brand-primary">Kontrol Sistemi</p>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClasses}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
