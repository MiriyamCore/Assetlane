import type { PublicSettings } from '../../types/store';
import { getSocialLinks } from '../../lib/storefront-content';

export function SocialLinks({ settings, className }: { settings: PublicSettings; className?: string }) {
  const links = getSocialLinks(settings);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className={className || 'social-links'}>
      {links.map((link) => (
        <a key={link.key} href={link.url} rel="noreferrer" target="_blank">
          {link.label}
        </a>
      ))}
    </div>
  );
}
