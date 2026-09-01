import type { PublicSettings } from '../../types/store';
import { AboutSection } from './AboutSection';
import { FaqSection } from './FaqSection';
import { TrustSection } from './TrustSection';

export function HomeContentSections({ settings }: { settings: PublicSettings }) {
  return (
    <>
      <AboutSection settings={settings} />
      <FaqSection settings={settings} />
      <TrustSection settings={settings} />
    </>
  );
}
