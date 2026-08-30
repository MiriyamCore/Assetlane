import { Link } from 'react-router-dom';
import type { PublicSettings } from '../../types/store';
import { hasAnnouncement } from '../../lib/storefront-content';

export function AnnouncementBar({ settings }: { settings: PublicSettings }) {
  if (!hasAnnouncement(settings)) {
    return null;
  }

  const content = <span>{settings.announcementText}</span>;

  return (
    <div className="announcement-bar">
      <div className="container announcement-shell">
        {settings.announcementUrl ? (
          <a href={settings.announcementUrl} rel="noreferrer" target="_blank">
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    </div>
  );
}

export function AnnouncementPreview({ text, url }: { text: string; url: string }) {
  if (!text.trim()) {
    return <p className="settings-preview-note">No announcement is visible until you add announcement text.</p>;
  }

  return (
    <div className="announcement-bar announcement-bar-preview">
      <div className="announcement-shell">
        {url.trim() ? (
          <Link to={url} onClick={(event) => event.preventDefault()}>
            {text}
          </Link>
        ) : (
          <span>{text}</span>
        )}
      </div>
    </div>
  );
}
