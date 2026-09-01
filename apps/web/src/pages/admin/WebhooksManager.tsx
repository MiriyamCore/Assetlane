import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { LoaderCircle, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { EmptyPanel, InlineError, SuccessInline } from '../../components/ui/States';

export type WebhookEndpoint = {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
};

export function WebhooksManager() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [url, setUrl] = useState('');

  const loadEndpoints = async () => {
    const result = await apiFetch<WebhookEndpoint[]>('/webhooks');
    setEndpoints(result);
  };

  useEffect(() => {
    loadEndpoints()
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load webhooks.'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiFetch('/webhooks', {
        method: 'POST',
        body: JSON.stringify({
          url,
          events: ['order.paid', 'order.refunded'],
        }),
      });
      setUrl('');
      setSuccessMessage('Webhook endpoint added.');
      await loadEndpoints();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create webhook endpoint.');
    } finally {
      setSaving(false);
    }
  };

  const rotateSecret = async (endpoint: WebhookEndpoint) => {
    try {
      await apiFetch(`/webhooks/${endpoint.id}/rotate-secret`, { method: 'POST' });
      setSuccessMessage('Webhook secret rotated.');
      await loadEndpoints();
    } catch (rotateError) {
      setError(rotateError instanceof Error ? rotateError.message : 'Unable to rotate webhook secret.');
    }
  };

  const remove = async (endpoint: WebhookEndpoint) => {
    if (!window.confirm(`Delete webhook endpoint ${endpoint.url}?`)) return;

    try {
      await apiFetch(`/webhooks/${endpoint.id}`, { method: 'DELETE' });
      await loadEndpoints();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete webhook endpoint.');
    }
  };

  if (loading) {
    return <EmptyPanel title="Loading webhooks" message="Fetching outbound webhook endpoints." />;
  }

  return (
    <div className="admin-stack">
      <div className="settings-note-card">
        <strong>Outbound webhooks</strong>
        <span>AssetLane signs each payload with HMAC SHA-256 in the <code>X-Assetlane-Signature</code> header. Events: <code>order.paid</code>, <code>order.refunded</code>.</span>
      </div>

      {error ? <InlineError message={error} /> : null}
      {successMessage ? <SuccessInline message={successMessage} /> : null}

      <form className="form-grid" onSubmit={submit}>
        <label className="form-field-full">
          Endpoint URL
          <input required type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://hooks.example.com/assetlane" />
        </label>
        <div className="form-actions">
          <button className="primary-button" disabled={saving} type="submit">
            {saving ? <LoaderCircle className="spin" size={16} /> : <Plus size={16} />}
            <span>Add webhook</span>
          </button>
        </div>
      </form>

      {endpoints.length === 0 ? (
        <EmptyPanel title="No webhooks yet" message="Connect Zapier, Make, or your own automation endpoint." />
      ) : (
        <div className="admin-stack">
          {endpoints.map((endpoint) => (
            <div key={endpoint.id} className="settings-note-card">
              <strong>{endpoint.url}</strong>
              <span>Events: {endpoint.events.join(', ')}</span>
              <code>Secret: {endpoint.secret}</code>
              <div className="button-stack">
                <button className="secondary-button" type="button" onClick={() => void rotateSecret(endpoint)}>
                  <RefreshCcw size={14} />
                  <span>Rotate secret</span>
                </button>
                <button className="secondary-button danger-button" type="button" onClick={() => void remove(endpoint)}>
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
