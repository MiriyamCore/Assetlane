import { LOCALES, localeLabels } from '../i18n/types';
import { useTranslation } from '../i18n/LocaleProvider';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useTranslation();

  return (
    <label className={compact ? 'language-switcher language-switcher-compact' : 'language-switcher'}>
      {!compact ? <span className="language-switcher-label">{t('common.language')}</span> : null}
      <select aria-label={t('common.language')} value={locale} onChange={(event) => setLocale(event.target.value as typeof locale)}>
        {LOCALES.map((option) => (
          <option key={option} value={option}>
            {localeLabels[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
