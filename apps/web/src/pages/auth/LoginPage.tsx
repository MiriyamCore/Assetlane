import { useState } from 'react';
import type { FormEvent } from 'react';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { InlineError } from '../../components/ui/States';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useTranslation } from '../../i18n/LocaleProvider';

export function LoginPage({ onLoggedIn }: { onLoggedIn: () => void }) {
  const { t } = useTranslation();
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
      <div className="admin-auth-toolbar">
        <LanguageSwitcher compact />
      </div>
      <section className="admin-auth-card panel">
        <span className="eyebrow">{t('auth.sellerAccess')}</span>
        <h1>{t('auth.signInTitle')}</h1>
        <p>{t('auth.signInBody')}</p>
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label>
            {t('common.email')}
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            {t('auth.password')}
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? <LoaderCircle className="spin" size={16} /> : <ShieldCheck size={16} />}
            <span>{submitting ? t('auth.signingIn') : t('auth.signIn')}</span>
          </button>
        </form>
        {error ? <InlineError message={error} /> : null}
      </section>
    </div>
  );
}
