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
  Tag,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { AuthUser, PublicSettings } from '../../types/store';
import { PRODUCT_NAME } from '../../lib/platform';
import { useTranslation } from '../../i18n/LocaleProvider';
import { LanguageSwitcher } from '../LanguageSwitcher';

function resolvePageMeta(path: string, t: (key: string) => string) {
  if (path.match(/^products\/[^/]+\/edit$/)) {
    return { title: t('admin.editProduct'), description: t('admin.editProductDesc') };
  }

  const pageMeta: Record<string, { title: string; description: string }> = {
    '': { title: t('admin.dashboard'), description: t('admin.dashboardDesc') },
    products: { title: t('admin.products'), description: t('admin.productsDesc') },
    'products/new': { title: t('admin.newProduct'), description: t('admin.newProductDesc') },
    purchases: { title: t('admin.orders'), description: t('admin.ordersDesc') },
    discounts: { title: t('admin.discounts'), description: t('admin.discountsDesc') },
    settings: { title: t('admin.settings'), description: t('admin.settingsDesc') },
  };

  return pageMeta[path] || { title: t('admin.adminFallback'), description: t('admin.adminFallbackDesc') };
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
  const { t } = useTranslation();
  const meta = resolvePageMeta(adminPath, t);
  const isSettings = adminPath === 'settings';
  const isEditor = adminPath === 'products/new' || /^products\/[^/]+\/edit$/.test(adminPath);
  const isFocusPage = isSettings || isEditor;

  return (
    <div className={isFocusPage ? 'admin-app admin-app-focus' : 'admin-app'}>
      {!isFocusPage ? (
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <strong>{settings.storeName || PRODUCT_NAME}</strong>
            <span>{t('admin.sellerDashboard')}</span>
          </div>

          <nav className="admin-nav">
            <NavLink className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')} end to="/admin">
              <LayoutDashboard size={15} />
              <span>{t('admin.dashboard')}</span>
            </NavLink>
            <NavLink className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')} to="/admin/products">
              <Package size={15} />
              <span>{t('admin.products')}</span>
            </NavLink>
            <NavLink className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')} to="/admin/products/new">
              <Plus size={15} />
              <span>{t('admin.newProduct')}</span>
            </NavLink>
            <NavLink className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')} to="/admin/purchases">
              <ShoppingBag size={15} />
              <span>{t('admin.orders')}</span>
            </NavLink>
            <NavLink className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')} to="/admin/discounts">
              <Tag size={15} />
              <span>{t('admin.discounts')}</span>
            </NavLink>
            <NavLink className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')} to="/admin/settings">
              <Settings size={15} />
              <span>{t('admin.settings')}</span>
            </NavLink>
          </nav>

          <div className="admin-sidebar-footer">
            <LanguageSwitcher />
            <a href="/" rel="noreferrer" target="_blank">
              <Store size={15} />
              <span>{t('admin.viewStorefront')}</span>
            </a>
            <button type="button" onClick={onLogout}>
              <LogOut size={15} />
              <span>{t('admin.signOut')}</span>
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
            <LanguageSwitcher compact />
            <span className="admin-user-chip">
              {user.email}
              {user.role === 'viewer' ? ` · ${t('admin.roleViewer')}` : user.role === 'owner' ? ` · ${t('admin.roleOwner')}` : ''}
            </span>
            <button className="secondary-button" type="button" onClick={onRefresh}>
              <RefreshCcw size={15} />
              <span>{t('common.refresh')}</span>
            </button>
            <a className="secondary-button" href="/" rel="noreferrer" target="_blank">
              <ExternalLink size={15} />
              <span>{t('admin.store')}</span>
            </a>
            {isFocusPage ? (
              <button className="secondary-button" type="button" onClick={onLogout}>
                <LogOut size={15} />
                <span>{t('admin.signOut')}</span>
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
