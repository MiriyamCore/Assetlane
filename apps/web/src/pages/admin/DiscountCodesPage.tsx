import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { EmptyPanel, InlineError, SuccessInline } from '../../components/ui/States';

export type DiscountCode = {
  id: string;
  code: string;
  percentOff: number | null;
  amountOffCents: number | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  active: boolean;
  expiresAt: string | null;
};

export function DiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'amount',
    percentOff: '10',
    amountOffCents: '500',
    maxRedemptions: '',
    expiresAt: '',
  });

  const loadCodes = async () => {
    const result = await apiFetch<DiscountCode[]>('/discounts');
    setCodes(result);
  };

  useEffect(() => {
    loadCodes()
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load discount codes.'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiFetch('/discounts', {
        method: 'POST',
        body: JSON.stringify({
          code: form.code,
          percentOff: form.discountType === 'percent' ? Number(form.percentOff) : undefined,
          amountOffCents: form.discountType === 'amount' ? Number(form.amountOffCents) : undefined,
          maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
          expiresAt: form.expiresAt || undefined,
        }),
      });
      setForm({
        code: '',
        discountType: 'percent',
        percentOff: '10',
        amountOffCents: '500',
        maxRedemptions: '',
        expiresAt: '',
      });
      setSuccessMessage('Discount code created.');
      await loadCodes();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create discount code.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (code: DiscountCode) => {
    try {
      await apiFetch(`/discounts/${code.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !code.active }),
      });
      await loadCodes();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Unable to update discount code.');
    }
  };

  const remove = async (code: DiscountCode) => {
    if (!window.confirm(`Delete discount code ${code.code}?`)) return;

    try {
      await apiFetch(`/discounts/${code.id}`, { method: 'DELETE' });
      await loadCodes();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete discount code.');
    }
  };

  if (loading) {
    return <EmptyPanel title="Loading discount codes" message="Fetching your promotion codes." />;
  }

  return (
    <div className="admin-stack">
      <div className="panel">
        <h2>Discount codes</h2>
        <p>Create promotion codes for checkout. Codes apply store-wide at checkout time.</p>
        {error ? <InlineError message={error} /> : null}
        {successMessage ? <SuccessInline message={successMessage} /> : null}

        <form className="form-grid" onSubmit={submit}>
          <label>
            Code
            <input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="LAUNCH10" />
          </label>
          <label>
            Discount type
            <select value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value as 'percent' | 'amount' })}>
              <option value="percent">Percent off</option>
              <option value="amount">Fixed amount off</option>
            </select>
          </label>
          {form.discountType === 'percent' ? (
            <label>
              Percent off
              <input required type="number" min="1" max="100" value={form.percentOff} onChange={(event) => setForm({ ...form, percentOff: event.target.value })} />
            </label>
          ) : (
            <label>
              Amount off (cents)
              <input required type="number" min="1" value={form.amountOffCents} onChange={(event) => setForm({ ...form, amountOffCents: event.target.value })} />
            </label>
          )}
          <label>
            Max redemptions
            <input type="number" min="1" value={form.maxRedemptions} onChange={(event) => setForm({ ...form, maxRedemptions: event.target.value })} placeholder="Unlimited" />
          </label>
          <label>
            Expires at
            <input type="datetime-local" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} />
          </label>
          <div className="form-actions">
            <button className="primary-button" disabled={saving} type="submit">
              {saving ? <LoaderCircle className="spin" size={16} /> : <Plus size={16} />}
              <span>Create code</span>
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <h3>Active codes</h3>
        {codes.length === 0 ? (
          <EmptyPanel title="No discount codes yet" message="Create your first promotion code above." />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Used</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr key={code.id}>
                    <td>{code.code}</td>
                    <td>{code.percentOff ? `${code.percentOff}%` : `${(code.amountOffCents || 0) / 100} off`}</td>
                    <td>
                      {code.redemptionCount}
                      {code.maxRedemptions ? ` / ${code.maxRedemptions}` : ''}
                    </td>
                    <td>{code.active ? 'Active' : 'Disabled'}</td>
                    <td className="table-actions">
                      <button className="secondary-button" type="button" onClick={() => void toggleActive(code)}>
                        {code.active ? 'Disable' : 'Enable'}
                      </button>
                      <button className="secondary-button danger-button" type="button" onClick={() => void remove(code)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
