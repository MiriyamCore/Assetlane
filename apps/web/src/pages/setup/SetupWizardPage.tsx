import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { DEFAULT_STORE_CURRENCY, STORE_CURRENCIES, STORE_CURRENCY_LABELS } from '../../lib/currency';
import { InlineError } from '../../components/ui/States';
import { COMPANY_NAME, PRODUCT_NAME } from '../../lib/platform';

type SetupStep = 'account' | 'store' | 'integrations';

export function SetupWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<SetupStep>('account');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    storeName: '',
    storeDescription: '',
    storeUrl: window.location.origin,
    supportEmail: '',
    defaultCurrency: DEFAULT_STORE_CURRENCY,
    stripeSecretKey: '',
    stripePublicKey: '',
    stripeWebhookSecret: '',
    paymentProviderMode: 'both',
    bkashAppKey: '',
    bkashAppSecret: '',
    bkashUsername: '',
    bkashPassword: '',
    bkashSandbox: 'true',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
  });

  useEffect(() => {
    apiFetch<{ completed: boolean }>('/setup/status')
      .then((status) => {
        if (status.completed) {
          navigate('/admin', { replace: true });
        }
      })
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const nextStep = () => {
    setError('');
    if (step === 'account') {
      if (!form.adminEmail.trim() || form.adminPassword.length < 8) {
        setError('Admin email and an 8+ character password are required.');
        return;
      }
      if (form.adminPassword !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setStep('store');
      return;
    }

    if (step === 'store') {
      if (!form.storeName.trim() || !form.storeDescription.trim()) {
        setError('Store name and description are required.');
        return;
      }
      setStep('integrations');
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await apiFetch('/setup', {
        method: 'POST',
        body: JSON.stringify({
          adminEmail: form.adminEmail,
          adminPassword: form.adminPassword,
          storeName: form.storeName,
          storeDescription: form.storeDescription,
          storeUrl: form.storeUrl,
          supportEmail: form.supportEmail || form.adminEmail,
          defaultCurrency: form.defaultCurrency,
          stripeSecretKey: form.stripeSecretKey,
          stripePublicKey: form.stripePublicKey,
          stripeWebhookSecret: form.stripeWebhookSecret,
          paymentProviderMode: form.paymentProviderMode,
          bkashAppKey: form.bkashAppKey,
          bkashAppSecret: form.bkashAppSecret,
          bkashUsername: form.bkashUsername,
          bkashPassword: form.bkashPassword,
          bkashSandbox: form.bkashSandbox,
          smtpHost: form.smtpHost,
          smtpPort: form.smtpPort,
          smtpUser: form.smtpUser,
          smtpPass: form.smtpPass,
          smtpFrom: form.smtpFrom,
        }),
      });
      navigate('/admin', { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to complete setup.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-setup-shell">
        <div className="panel centered-panel">
          <LoaderCircle className="spin" size={24} />
          <p>Checking install status…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-setup-shell">
      <form className="panel setup-panel" onSubmit={submit}>
        <span className="eyebrow">{COMPANY_NAME} · First-time setup</span>
        <h1>Welcome to {PRODUCT_NAME}</h1>
        <p>Create your admin account and store profile. Configure Stripe, bKash, and SMTP now or later in Settings → Payments.</p>

        <div className="setup-steps">
          <span className={step === 'account' ? 'setup-step active' : 'setup-step'}>1. Admin</span>
          <span className={step === 'store' ? 'setup-step active' : 'setup-step'}>2. Store</span>
          <span className={step === 'integrations' ? 'setup-step active' : 'setup-step'}>3. Integrations</span>
        </div>

        {error ? <InlineError message={error} /> : null}

        {step === 'account' ? (
          <div className="form-grid form-grid-3">
            <label>
              Admin email
              <input required type="email" value={form.adminEmail} onChange={(event) => updateField('adminEmail', event.target.value)} />
            </label>
            <label>
              Password
              <input required type="password" value={form.adminPassword} onChange={(event) => updateField('adminPassword', event.target.value)} />
            </label>
            <label>
              Confirm password
              <input required type="password" value={form.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} />
            </label>
          </div>
        ) : null}

        {step === 'store' ? (
          <div className="form-grid">
            <label>
              Store name
              <input required value={form.storeName} onChange={(event) => updateField('storeName', event.target.value)} />
            </label>
            <label>
              Store URL
              <input type="url" value={form.storeUrl} onChange={(event) => updateField('storeUrl', event.target.value)} />
            </label>
            <label className="form-field-full">
              Store description
              <textarea required rows={3} value={form.storeDescription} onChange={(event) => updateField('storeDescription', event.target.value)} />
            </label>
            <label>
              Support email
              <input type="email" value={form.supportEmail} onChange={(event) => updateField('supportEmail', event.target.value)} placeholder={form.adminEmail || 'support@yourstore.com'} />
            </label>
            <label>
              Store currency
              <select value={form.defaultCurrency} onChange={(event) => updateField('defaultCurrency', event.target.value)}>
                {STORE_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {STORE_CURRENCY_LABELS[currency]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        {step === 'integrations' ? (
          <div className="form-grid">
            <label>
              Stripe secret key
              <input type="password" value={form.stripeSecretKey} onChange={(event) => updateField('stripeSecretKey', event.target.value)} placeholder="sk_live_… or sk_test_…" />
            </label>
            <label>
              Stripe public key
              <input value={form.stripePublicKey} onChange={(event) => updateField('stripePublicKey', event.target.value)} placeholder="pk_live_… or pk_test_…" />
            </label>
            <label className="form-field-full">
              Stripe webhook secret
              <input type="password" value={form.stripeWebhookSecret} onChange={(event) => updateField('stripeWebhookSecret', event.target.value)} placeholder="whsec_…" />
            </label>
            <label>
              Payment providers
              <select value={form.paymentProviderMode} onChange={(event) => updateField('paymentProviderMode', event.target.value)}>
                <option value="stripe">Stripe only</option>
                <option value="bkash">bKash only</option>
                <option value="both">Stripe + bKash</option>
              </select>
            </label>
            <label>
              bKash app key
              <input value={form.bkashAppKey} onChange={(event) => updateField('bkashAppKey', event.target.value)} />
            </label>
            <label>
              bKash app secret
              <input type="password" value={form.bkashAppSecret} onChange={(event) => updateField('bkashAppSecret', event.target.value)} />
            </label>
            <label>
              bKash username
              <input value={form.bkashUsername} onChange={(event) => updateField('bkashUsername', event.target.value)} />
            </label>
            <label>
              bKash password
              <input type="password" value={form.bkashPassword} onChange={(event) => updateField('bkashPassword', event.target.value)} />
            </label>
            <label className="settings-toggle">
              <input
                checked={form.bkashSandbox === 'true'}
                onChange={(event) => updateField('bkashSandbox', event.target.checked ? 'true' : 'false')}
                type="checkbox"
              />
              <span>bKash sandbox mode</span>
            </label>
            <label>
              SMTP host
              <input value={form.smtpHost} onChange={(event) => updateField('smtpHost', event.target.value)} />
            </label>
            <label>
              SMTP port
              <input type="number" value={form.smtpPort} onChange={(event) => updateField('smtpPort', event.target.value)} />
            </label>
            <label>
              SMTP user
              <input value={form.smtpUser} onChange={(event) => updateField('smtpUser', event.target.value)} />
            </label>
            <label>
              SMTP password
              <input type="password" value={form.smtpPass} onChange={(event) => updateField('smtpPass', event.target.value)} />
            </label>
            <label>
              SMTP from
              <input type="email" value={form.smtpFrom} onChange={(event) => updateField('smtpFrom', event.target.value)} />
            </label>
          </div>
        ) : null}

        <div className="setup-actions">
          {step !== 'account' ? (
            <button
              className="secondary-button"
              type="button"
              onClick={() => setStep(step === 'integrations' ? 'store' : 'account')}
            >
              Back
            </button>
          ) : null}
          {step !== 'integrations' ? (
            <button className="primary-button" type="button" onClick={nextStep}>
              Continue
            </button>
          ) : (
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? <LoaderCircle className="spin" size={16} /> : null}
              <span>{submitting ? 'Finishing setup…' : 'Finish setup'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
