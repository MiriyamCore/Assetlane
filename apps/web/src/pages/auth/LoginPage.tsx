import { useState } from 'react';
import type { FormEvent } from 'react';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { InlineError } from '../../components/ui/States';

export function LoginPage({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      onLoggedIn();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to log in.');
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <section className="admin-auth-card panel">
        <span className="eyebrow">Seller access</span>
        <h1>Sign in to your dashboard</h1>
        <p>Manage products, orders, delivery settings, and storefront configuration.</p>
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? <LoaderCircle className="spin" size={16} /> : <ShieldCheck size={16} />}
            <span>{submitting ? 'Signing in' : 'Sign in'}</span>
          </button>
        </form>
        {error ? <InlineError message={error} /> : null}
      </section>
    </div>
  );
}
