import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogIn, Store } from 'lucide-react';
import type { StoreThemeBase } from '../lib/storefront-theme';

type NavbarProps = {
  storeName: string;
  logoUrl: string;
  showAdminLinks: boolean;
  themeBase?: StoreThemeBase;
};

const Navbar = ({ storeName, logoUrl, showAdminLinks, themeBase = 'atelier' }: NavbarProps) => {
  const location = useLocation();
  const onAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');

  return (
    <header className={`site-header site-header-${themeBase}`}>
      <div className="container nav-shell">
        <Link className="brand-mark" to="/">
          {logoUrl ? <img className="brand-logo" src={logoUrl} alt={storeName} /> : <Store size={18} />}
          <span>{storeName}</span>
        </Link>

        <nav className="nav-links">
          <Link to="/">Storefront</Link>
          <Link to="/library">My purchases</Link>
          {showAdminLinks || onAdminRoute ? (
            <>
              <Link to="/admin">
                <LayoutDashboard size={16} />
                <span>Admin</span>
              </Link>
              <Link to="/login">
                <LogIn size={16} />
                <span>Login</span>
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
