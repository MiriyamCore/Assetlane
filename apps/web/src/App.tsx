import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { HeadlessGuard, SetupGuard } from './components/SetupGuard';
import { StorefrontLayout } from './components/StorefrontLayout';
import { apiFetch } from './lib/api';
import { defaultSettings } from './lib/product-form';
import { defaultStoreThemeId } from './storefront/catalog';
import { LoginPage } from './pages/auth/LoginPage';
import { AdminWorkspace } from './pages/admin/AdminWorkspace';
import { CancelPage } from './pages/public/CancelPage';
import { DownloadPage } from './pages/public/DownloadPage';
import { HomePage } from './pages/public/HomePage';
import { ProductPage } from './pages/public/ProductPage';
import { SuccessPage } from './pages/public/SuccessPage';
import { SetupWizardPage } from './pages/setup/SetupWizardPage';
import type { PublicSettings } from './types/store';

function ProductRoute({ settings }: { settings: PublicSettings }) {
  const params = useParams();
  return <ProductPage settings={settings} slug={params.slug} />;
}

function DownloadRoute({ settings }: { settings: PublicSettings }) {
  const params = useParams();
  return <DownloadPage settings={settings} token={params.token} />;
}

function AppRoutes({ settings, onSettingsSaved }: { settings: PublicSettings; onSettingsSaved: (value: PublicSettings) => void }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <Routes>
      <Route path="/setup" element={<SetupWizardPage />} />

      <Route element={<AdminLayout />}>
        <Route path="/login" element={<LoginPage onLoggedIn={() => navigate('/admin')} />} />
        <Route path="/admin/*" element={<AdminWorkspace onSettingsSaved={onSettingsSaved} settings={settings} />} />
      </Route>

      <Route element={<StorefrontLayout settings={settings} />}>
        <Route
          path="/"
          element={
            <HeadlessGuard storeMode={settings.storeMode}>
              <HomePage settings={settings} />
            </HeadlessGuard>
          }
        />
        <Route
          path="/product/:slug"
          element={
            <HeadlessGuard storeMode={settings.storeMode}>
              <ProductRoute settings={settings} />
            </HeadlessGuard>
          }
        />
        <Route
          path="/success"
          element={
            <SuccessPage
              purchaseId={searchParams.get('purchase_id')}
              sessionId={searchParams.get('session_id')}
              settings={settings}
            />
          }
        />
        <Route path="/cancel" element={<CancelPage productSlug={searchParams.get('product')} settings={settings} />} />
        <Route path="/download/:token" element={<DownloadRoute settings={settings} />} />
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

function App() {
  const [settings, setSettings] = useState<PublicSettings>(defaultSettings);

  useEffect(() => {
    apiFetch<PublicSettings>('/settings')
      .then((data) =>
        setSettings({
          ...defaultSettings,
          ...data,
          storefrontTheme: data.storefrontTheme || defaultStoreThemeId,
          storefrontThemeBase: data.storefrontThemeBase || defaultStoreThemeId,
          storefrontThemeStylesheetUrl: data.storefrontThemeStylesheetUrl || '',
          storefrontThemePackageLayout: data.storefrontThemePackageLayout || '',
        })
      )
      .catch((error) => console.error('settings error', error));
  }, []);

  useEffect(() => {
    const linkId = 'assetlane-favicon';
    const existingLink = document.getElementById(linkId);

    if (!settings.faviconUrl) {
      existingLink?.remove();
      return;
    }

    const link = existingLink instanceof HTMLLinkElement ? existingLink : document.createElement('link');
    link.id = linkId;
    link.rel = 'icon';
    link.href = settings.faviconUrl;

    if (!existingLink) {
      document.head.appendChild(link);
    }
  }, [settings.faviconUrl]);

  return (
    <BrowserRouter>
      <SetupGuard>
        <div className="page-shell">
          <AppRoutes onSettingsSaved={setSettings} settings={settings} />
        </div>
      </SetupGuard>
    </BrowserRouter>
  );
}

export default App;
