import type { ReactNode } from 'react';
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  RefreshCcw,
  Settings,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { AuthUser, PublicSettings } from '../../types/store';
import { PRODUCT_NAME } from '../../lib/platform';

const pageMeta: Record<string, { title: string; description: string }> = {
  '': { title: 'Dashboard', description: 'Revenue, orders, and store performance at a glance.' },
  products: { title: 'Products', description: 'Manage digital products, pricing, and delivery files.' },
  'products/new': { title: 'New product', description: 'Create a new digital product listing.' },
  purchases: { title: 'Orders', description: 'Track purchases, delivery status, and download activity.' },
  settings: { title: 'Settings', description: 'Branding, storefront, payments, email, and distribution.' },
};

function resolvePageMeta(path: string) {
  if (path.match(/^products\/[^/]+\/edit$/)) {
    return { title: 'Edit product', description: 'Update product details, files, and publish state.' };
  }
  return pageMeta[path] || { title: 'Admin', description: 'Manage your digital storefront.' };
}

export function AdminShell({
  adminPath,
  children,
  onLogout,
  onRefresh,
  settings,
  user,
}: {
  adminPath: string;
  children: ReactNode;
  onLogout: () => void;
  onRefresh: () => void;
  settings: PublicSettings;
  user: AuthUser;
}) {
  const meta = resolvePageMeta(adminPath);
  const isSettings = adminPath === 'settings';
  const isEditor = adminPath === 'products/new' || /^products\/[^/]+\/edit$/.test(adminPath);
  const isFocusPage = isSettings || isEditor;

  return (
    <div className={isFocusPage ? 'admin-app admin-app-focus' : 'admin-app'}>
      {!isFocusPage ? (
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <strong>{settings.storeName || PRODUCT_NAME}</strong>
            <span>Seller dashboard</span>
          </div>

          <nav className="admin-nav">
            <NavLink className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')} end to="/admin">
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')} to="/admin/products">
              <Package size={15} />
              <span>Products</span>
            </NavLink>
            <NavLink className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')} to="/admin/products/new">
              <Plus size={15} />
              <span>New product</span>
            </NavLink>
            <NavLink className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')} to="/admin/purchases">
              <ShoppingBag size={15} />
              <span>Orders</span>
            </NavLink>
            <NavLink className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')} to="/admin/settings">
              <Settings size={15} />
              <span>Settings</span>
            </NavLink>
          </nav>

          <div className="admin-sidebar-footer">
            <a href="/" rel="noreferrer" target="_blank">
              <Store size={15} />
              <span>View storefront</span>
            </a>
            <button type="button" onClick={onLogout}>
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>
      ) : null}

      <div className="admin-main">
        <header className={isFocusPage ? 'admin-topbar admin-topbar-settings' : 'admin-topbar'}>
          <div className="admin-topbar-copy">
            <h1>{meta.title}</h1>
            {!isFocusPage ? <p>{meta.description}</p> : null}
          </div>
          <div className="admin-topbar-actions">
            <span className="admin-user-chip">{user.email}</span>
            <button className="secondary-button" type="button" onClick={onRefresh}>
              <RefreshCcw size={15} />
              <span>Refresh</span>
            </button>
            <a className="secondary-button" href="/" rel="noreferrer" target="_blank">
              <ExternalLink size={15} />
              <span>Store</span>
            </a>
            {isFocusPage ? (
              <button className="secondary-button" type="button" onClick={onLogout}>
                <LogOut size={15} />
                <span>Sign out</span>
              </button>
            ) : null}
          </div>
        </header>
        <div
          className={
            isSettings
              ? 'admin-page admin-page-settings'
              : isEditor
                ? 'admin-page admin-page-editor'
                : 'admin-page'
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
