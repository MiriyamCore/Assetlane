import { useEffect } from 'react';
import { useTranslation } from '../../i18n/LocaleProvider';

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const resolvedConfirmLabel = confirmLabel || t('common.confirm');
  const resolvedCancelLabel = cancelLabel || t('common.cancel');

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        onCancel();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [busy, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="confirm-dialog-backdrop" onClick={busy ? undefined : onCancel} role="presentation">
      <div
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="confirm-dialog"
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
      >
        <h3 id="confirm-dialog-title">{title}</h3>
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <button className="secondary-button" disabled={busy} type="button" onClick={onCancel}>
            {resolvedCancelLabel}
          </button>
          <button
            className={tone === 'danger' ? 'primary-button danger-button' : 'primary-button'}
            disabled={busy}
            type="button"
            onClick={onConfirm}
          >
            {resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
