import type { ReactNode } from 'react';
import { AlertCircle, Check, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LocaleProvider';

export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function DetailPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-pair">
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}

export function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="container narrow-shell">
      <div className="panel centered-panel">
        <LoaderCircle className="spin" size={22} />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="inline-error">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );
}

export function SuccessInline({ message }: { message: string }) {
  return (
    <div className="inline-success">
      <Check size={16} />
      <span>{message}</span>
    </div>
  );
}

export function EmptyPanel({ title, message }: { title: string; message: string }) {
  const { t } = useTranslation();

  return (
    <div className="panel centered-panel">
      <span className="eyebrow">{t('common.nothingYet')}</span>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export function ErrorPanel({
  title,
  message,
  action,
}: {
  title?: string;
  message: string;
  action?: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="container narrow-shell">
      <div className="panel centered-panel danger-panel">
        <AlertCircle size={20} />
        <h2>{title || t('common.somethingWrong')}</h2>
        <p>{message}</p>
        {action || (
          <Link className="secondary-link" to="/">
            {t('common.returnHome')}
          </Link>
        )}
      </div>
    </div>
  );
}

export function SuccessPanel({
  title,
  message,
  detail,
  downloadUrl,
  pending,
}: {
  title: string;
  message: string;
  detail?: string;
  downloadUrl?: string;
  pending?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="panel centered-panel success-panel">
      <Check size={22} />
      <h2>{title}</h2>
      <p>{message}</p>
      {detail ? <span className="support-chip">{detail}</span> : null}
      {pending ? <span className="support-chip">{t('common.confirmingPayment')}</span> : null}
      {downloadUrl ? (
        <a className="primary-link" href={downloadUrl}>
          {t('common.openSecureDownload')}
        </a>
      ) : null}
      <Link className={downloadUrl ? 'secondary-link' : 'primary-link'} to="/">
        {t('common.backToStorefront')}
      </Link>
    </div>
  );
}
