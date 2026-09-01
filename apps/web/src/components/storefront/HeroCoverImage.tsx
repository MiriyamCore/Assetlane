import type { PublicSettings } from '../../types/store';

export function HeroCoverImage({ settings, className }: { settings: PublicSettings; className?: string }) {
  if (!settings.heroImageUrl) {
    return null;
  }

  return (
    <div className={className || 'hero-cover'}>
      <img alt="" className="hero-cover-image" src={settings.heroImageUrl} />
    </div>
  );
}
