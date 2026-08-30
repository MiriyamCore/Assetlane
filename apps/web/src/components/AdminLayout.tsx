import { useEffect, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

export function AdminLayout({ children }: { children?: ReactNode }) {
  useEffect(() => {
    document.body.dataset.surface = 'admin';
    return () => {
      delete document.body.dataset.surface;
    };
  }, []);

  return <div className="admin-shell">{children || <Outlet />}</div>;
}
