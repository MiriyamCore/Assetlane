import { ShieldCheck } from 'lucide-react';
import type { PublicSettings } from '../../types/store';
import { getTrustBlocks, hasTrustSection } from '../../lib/storefront-content';

export function TrustSection({ settings }: { settings: PublicSettings }) {
  if (!hasTrustSection(settings)) {
    return null;
  }

  const blocks = getTrustBlocks(settings);

  return (
    <section className="trust-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Trust</span>
          <h2>{settings.trustTitle || 'Why shop here'}</h2>
        </div>
      </div>
      <div className="trust-section-grid">
        {blocks.map((block, index) => (
          <article className="trust-card" key={`${block.title}-${index}`}>
            <ShieldCheck size={18} />
            <div>
              {block.title ? <strong>{block.title}</strong> : null}
              {block.body ? <span>{block.body}</span> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
