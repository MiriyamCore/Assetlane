import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

export function SafeMarkdown({ content, className }: { content: string; className?: string }) {
  if (!content.trim()) {
    return null;
  }

  return (
    <div className={className ? `markdown-content ${className}` : 'markdown-content'}>
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{content}</ReactMarkdown>
    </div>
  );
}
