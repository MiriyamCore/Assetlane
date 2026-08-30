import { useState } from 'react';
import { SafeMarkdown } from '../ui/SafeMarkdown';

export function MarkdownField({
  value,
  onChange,
  rows = 8,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
}) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  return (
    <div className="markdown-field">
      <div className="markdown-field-tabs" role="tablist" aria-label="Description editor mode">
        <button
          className={tab === 'write' ? 'markdown-field-tab active' : 'markdown-field-tab'}
          type="button"
          role="tab"
          aria-selected={tab === 'write'}
          onClick={() => setTab('write')}
        >
          Write
        </button>
        <button
          className={tab === 'preview' ? 'markdown-field-tab active' : 'markdown-field-tab'}
          type="button"
          role="tab"
          aria-selected={tab === 'preview'}
          onClick={() => setTab('preview')}
        >
          Preview
        </button>
      </div>
      {tab === 'write' ? (
        <textarea
          required={required}
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <div className="markdown-field-preview">
          {value.trim() ? <SafeMarkdown content={value} /> : <p className="markdown-field-empty">Nothing to preview yet.</p>}
        </div>
      )}
      <small>Safe Markdown supported: headings, lists, links, emphasis, and inline code.</small>
    </div>
  );
}
