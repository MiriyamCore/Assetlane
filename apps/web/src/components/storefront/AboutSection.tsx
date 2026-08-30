import type { PublicSettings } from '../../types/store';
import { hasAboutSection } from '../../lib/storefront-content';

export function AboutSection({ settings }: { settings: PublicSettings }) {
  if (!hasAboutSection(settings)) {
    return null;
  }

  return (
    <section className="about-section">
      <div className="section-heading">
        <div>
          {settings.aboutTitle ? <span className="eyebrow">About</span> : null}
          <h2>{settings.aboutTitle || 'About this store'}</h2>
        </div>
      </div>
      <div className="about-section-body">
        <p>{settings.aboutBody}</p>
      </div>
    </section>
  );
}
