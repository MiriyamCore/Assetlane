import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Download, LoaderCircle, Mail } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { ErrorPanel, InlineError, LoadingPanel, SuccessInline } from '../../components/ui/States';
import type { PublicSettings } from '../../types/store';

type LibraryPurchase = {
  id: string;
  product?: { title: string; slug: string };
  downloadUrl: string;
  purchasedAt: string | null;
};

type LibraryPayload = {
  email: string;
  expiresAt: string;
  purchases: LibraryPurchase[];
};

export function LibraryPage({ settings }: { settings: PublicSettings }) {
  const [token, setToken] = useState(() => new URLSearchParams(window.location.search).get('token') || '');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(Boolean(token));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [library, setLibrary] = useState<LibraryPayload | null>(null);

  useEffect(() => {
    if (!token) return;

    apiFetch<LibraryPayload>(`/library?token=${encodeURIComponent(token)}`)
      .then(setLibrary)
      .catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : 'Unable to open library.'))
      .finally(() => setLoading(false));
  }, [token]);

  const requestAccess = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await apiFetch<{ message: string }>('/library/request-access', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage(response.message);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to send library link.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingPanel label="Opening your purchase library" />;
  }

  if (library) {
    return (
      <div className="canvas-page">
        <h1>Your purchases</h1>
        <p>Signed in as {library.email}. This library link expires {new Date(library.expiresAt).toLocaleString()}.</p>
        {library.purchases.length === 0 ? (
          <p>No paid purchases were found for this email yet.</p>
        ) : (
          <div className="admin-stack">
            {library.purchases.map((purchase) => (
              <div key={purchase.id} className="review-card">
                <strong>{purchase.product?.title || 'Product'}</strong>
                <span>{purchase.purchasedAt ? new Date(purchase.purchasedAt).toLocaleString() : 'Purchase date unavailable'}</span>
                <a className="primary-link" href={purchase.downloadUrl}>
                  <Download size={16} />
                  <span>Open download page</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="canvas-page">
      <h1>Purchase library</h1>
      <p>Enter the email you used at checkout. We will send a secure link to view all purchases from {settings.storeName}.</p>
      {error ? <InlineError message={error} /> : null}
      {message ? <SuccessInline message={message} /> : null}
      <form className="checkout-form" onSubmit={requestAccess}>
        <label>
          Email
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        </label>
        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? <LoaderCircle className="spin" size={16} /> : <Mail size={16} />}
          <span>{submitting ? 'Sending link' : 'Email me my library link'}</span>
        </button>
      </form>
    </div>
  );
}
