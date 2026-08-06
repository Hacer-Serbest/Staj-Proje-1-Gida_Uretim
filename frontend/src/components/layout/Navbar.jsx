import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';
import { ROLE_LABELS } from '../../utils/roles';

const getInitials = (fullName = '') =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="relative z-10 flex items-center justify-between bg-white/70 px-6 py-4 shadow-soft-sm backdrop-blur-md">
      <div className="md:hidden">
        <p className="text-lg font-bold text-brand-primary">Gıda Üretim Kontrol</p>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {user && (
          <Link
            to="/account"
            className="flex items-center gap-3 rounded-xl px-2 py-1 transition-colors duration-200 hover:bg-brand-primary/6"
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{user.full_name}</p>
              <p className="text-xs text-brand-primary/70">{ROLE_LABELS[user.role] || user.role}</p>
            </div>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-soft-sm"
              style={{ background: 'linear-gradient(135deg, #0f2438 0%, #0f2438 60%, #b7ab8c 100%)' }}
            >
              {getInitials(user.full_name)}
            </span>
          </Link>
        )}
        <Button variant="outline" onClick={logout} className="gap-1.5">
          <LogOut size={16} />
          Çıkış Yap
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
