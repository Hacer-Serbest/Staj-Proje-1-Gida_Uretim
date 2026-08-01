import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';
import { ROLE_LABELS } from '../../utils/roles';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-brand-primary/15 bg-white/60 px-6 py-4 backdrop-blur-sm">
      <div className="md:hidden">
        <p className="text-lg font-bold text-brand-primary">Gıda Üretim Kontrol</p>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {user && (
          <Link to="/account" className="text-right hover:opacity-80">
            <p className="text-sm font-medium text-slate-800">{user.full_name}</p>
            <p className="text-xs text-brand-primary/70">{ROLE_LABELS[user.role] || user.role}</p>
          </Link>
        )}
        <Button variant="outline" onClick={logout}>
          Çıkış Yap
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
