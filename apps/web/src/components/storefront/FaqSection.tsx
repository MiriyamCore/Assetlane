import type { PublicSettings } from '../../types/store';
import { hasFaqSection } from '../../lib/storefront-content';
import { SafeMarkdown } from '../ui/SafeMarkdown';

export function FaqSection({ settings }: { settings: PublicSettings }) {
  if (!hasFaqSection(settings)) {
    return null;
  }

  return (
    <section className="faq-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FAQ</span>
          <h2>{settings.faqTitle || 'Frequently asked questions'}</h2>
        </div>
      </div>
      <div className="faq-section-body">
        <SafeMarkdown content={settings.faqBody} />
      </div>
    </section>
  );
}
