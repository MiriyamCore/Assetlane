import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AdminShell } from '../../components/admin/AdminShell';
import { apiFetch } from '../../lib/api';
import { defaultSettings } from '../../lib/product-form';
import type { AuthUser, Product, PublicSettings, SettingsMap, StatsPayload, StoreTheme } from '../../types/store';
import { ErrorPanel, InlineError, LoadingPanel } from '../../components/ui/States';
import { AdminOverviewPage } from './AdminOverviewPage';
import { DiscountCodesPage } from './DiscountCodesPage';
import { ProductCatalogPage } from './ProductCatalogPage';
import { ProductEditorPage } from './ProductEditorPage';
import { PurchaseManager } from './PurchaseManager';
import { StoreSettingsPage } from './StoreSettingsPage';

export function AdminWorkspace({
  settings,
  onSettingsSaved,
}: {
  settings: PublicSettings;
  onSettingsSaved: (value: PublicSettings) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [adminSettings, setAdminSettings] = useState<SettingsMap>({});
  const [themes, setThemes] = useState<StoreTheme[]>([]);
  const [screenError, setScreenError] = useState('');

  const loadWorkspace = async () => {
    const [me, statsPayload, productPayload, settingsPayload, themePayload] = await Promise.all([
      apiFetch<{ user: AuthUser }>('/auth/me'),
      apiFetch<StatsPayload>('/stats'),
      apiFetch<Product[]>('/products?admin=true'),
      apiFetch<SettingsMap>('/settings/admin'),
      apiFetch<{ themes: StoreTheme[] }>('/themes/admin'),
    ]);

    setUser(me.user);
    setStats(statsPayload);
    setProducts(productPayload);
    setAdminSettings(settingsPayload);
    setThemes(themePayload.themes);
  };

  useEffect(() => {
    loadWorkspace()
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unable to load admin dashboard.';
        if (/authentication|session|sign in/i.test(message)) {
          navigate('/login');
          return;
        }
        setScreenError(message);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const refreshWorkspace = async () => {
    try {
      await refreshWorkspaceInner();
    } catch (error) {
      setScreenError(error instanceof Error ? error.message : 'Unable to refresh admin data.');
    }
  };

  const refreshWorkspaceInner = async () => {
    await loadWorkspace();
  };

  const logout = async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    navigate('/login');
  };

  const changeStatus = async (productId: string, status: Product['status']) => {
    try {
      await apiFetch(`/products/${productId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await refreshWorkspaceInner();
    } catch (error) {
      setScreenError(error instanceof Error ? error.message : 'Unable to change product status.');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!window.confirm('Delete this product? Existing purchase records will lose the attached product record.')) {
      return;
    }

    try {
      await apiFetch(`/products/${productId}`, { method: 'DELETE' });
      await refreshWorkspaceInner();
    } catch (error) {
      setScreenError(error instanceof Error ? error.message : 'Unable to delete product.');
    }
  };

  const saveSettings = async (nextSettings: SettingsMap) => {
    const updated = await apiFetch<SettingsMap>('/settings', {
      method: 'PUT',
      body: JSON.stringify(nextSettings),
    });
    const publicSettings = await apiFetch<PublicSettings>('/settings');

    setAdminSettings(updated);
    onSettingsSaved({
      ...defaultSettings,
      ...publicSettings,
    });
  };

  if (loading) {
    return (
      <div className="admin-auth-page">
        <LoadingPanel label="Loading dashboard" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const adminPath = location.pathname.replace(/^\/admin\/?/, '');
  const editingMatch = adminPath.match(/^products\/([^/]+)\/edit$/);
  const editingProduct = editingMatch ? products.find((product) => product.id === editingMatch[1]) || null : null;

  let content: ReactNode = null;
  if (adminPath === '') {
    content = stats ? (
      <AdminOverviewPage
        currency={adminSettings.defaultCurrency || settings.defaultCurrency}
        products={products}
        settings={{ ...settings, ...adminSettings }}
        stats={stats}
      />
    ) : null;
  } else if (adminPath === 'products') {
    content = <ProductCatalogPage onDelete={deleteProduct} onStatusChange={changeStatus} products={products} />;
  } else if (adminPath === 'products/new') {
    content = (
      <ProductEditorPage
        defaultCurrency={adminSettings.defaultCurrency || settings.defaultCurrency}
        mode="create"
        storeUrl={adminSettings.storeUrl || settings.storeUrl}
        onSaved={async () => {
          await refreshWorkspaceInner();
          navigate('/admin/products');
        }}
      />
    );
  } else if (editingMatch) {
    content = editingProduct ? (
      <ProductEditorPage
        defaultCurrency={adminSettings.defaultCurrency || settings.defaultCurrency}
        mode="edit"
        storeUrl={adminSettings.storeUrl || settings.storeUrl}
        onSaved={async () => {
          await refreshWorkspaceInner();
          navigate('/admin/products');
        }}
        product={editingProduct}
      />
    ) : (
      <ErrorPanel message="The product you are trying to edit no longer exists." title="Product not found" />
    );
  } else if (adminPath === 'purchases') {
    content = <PurchaseManager products={products} />;
  } else if (adminPath === 'discounts') {
    content = <DiscountCodesPage />;
  } else if (adminPath === 'settings') {
    content = (
      <StoreSettingsPage
        products={products}
        storeUrl={adminSettings.storeUrl || settings.storeUrl}
        themes={themes}
        onInstallTheme={async (file) => {
          const payload = new FormData();
          payload.append('themePackage', file);

          const response = await apiFetch<{ theme: StoreTheme; themes: StoreTheme[]; warnings?: string[] }>('/themes/install', {
            method: 'POST',
            body: payload,
          });

          setThemes(response.themes);
          setAdminSettings((current) => ({
            ...current,
            storefrontTheme: response.theme.id,
          }));

          return response.warnings;
        }}
        onDownloadTheme={(theme) => {
          window.location.href = `${theme.downloadUrl}?t=${Date.now()}`;
        }}
        onRemoveTheme={async (theme) => {
          const response = await apiFetch<{ themes: StoreTheme[] }>(`/themes/${theme.id}`, {
            method: 'DELETE',
          });

          setThemes(response.themes);
          const updatedSettings = await apiFetch<SettingsMap>('/settings/admin');
          const publicSettings = await apiFetch<PublicSettings>('/settings');
          setAdminSettings(updatedSettings);
          onSettingsSaved({
            ...defaultSettings,
            ...publicSettings,
          });
        }}
        onSaveBrandingAssets={async (files) => {
          const payload = new FormData();
          if (files.logo) payload.append('logo', files.logo);
          if (files.favicon) payload.append('favicon', files.favicon);
          if (files.heroImage) payload.append('heroImage', files.heroImage);
          if (files.removeLogo) payload.append('removeLogo', 'true');
          if (files.removeFavicon) payload.append('removeFavicon', 'true');
          if (files.removeHeroImage) payload.append('removeHeroImage', 'true');

          if (!files.logo && !files.favicon && !files.heroImage && !files.removeLogo && !files.removeFavicon && !files.removeHeroImage) {
            return;
          }

          await apiFetch('/settings/branding', {
            method: 'PUT',
            body: payload,
          });

          const updatedSettings = await apiFetch<SettingsMap>('/settings/admin');
          const publicSettings = await apiFetch<PublicSettings>('/settings');
          setAdminSettings(updatedSettings);
          onSettingsSaved({
            ...defaultSettings,
            ...publicSettings,
          });
        }}
        onSaved={async (nextSettings) => {
          try {
            await saveSettings(nextSettings);
          } catch (error) {
            setScreenError(error instanceof Error ? error.message : 'Unable to save settings.');
            throw error;
          }
        }}
        settings={adminSettings}
      />
    );
  } else {
    content = <ErrorPanel message="The requested admin page does not exist." title="Unknown admin page" />;
  }

  return (
    <AdminShell adminPath={adminPath} onLogout={logout} onRefresh={refreshWorkspace} settings={settings} user={user}>
      {screenError ? <InlineError message={screenError} /> : null}
      {content}
    </AdminShell>
  );
}
