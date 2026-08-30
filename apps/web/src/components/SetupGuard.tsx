import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { LoadingPanel } from './ui/States';
import { PRODUCT_NAME } from '../lib/platform';

export function SetupGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(true);

  useEffect(() => {
    apiFetch<{ completed: boolean }>('/setup/status')
      .then((status) => {
        setCompleted(status.completed);
      })
      .catch(() => setCompleted(false))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <LoadingPanel label={`Preparing ${PRODUCT_NAME}`} />;
  }

  if (!completed && !location.pathname.startsWith('/setup')) {
    return <Navigate replace to="/setup" />;
  }

  if (completed && location.pathname.startsWith('/setup')) {
    return <Navigate replace to="/admin" />;
  }

  return <>{children}</>;
}

export function HeadlessGuard({ storeMode, children }: { storeMode: string; children: ReactNode }) {
  if (storeMode === 'headless') {
    return (
      <div className="container narrow-shell">
        <section className="panel centered-panel">
          <h2>Headless mode is enabled</h2>
          <p>This store is configured for API-only delivery. Use the headless API or embed routes to sell products.</p>
        </section>
      </div>
    );
  }

  return <>{children}</>;
}
