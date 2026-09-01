import { API_ROOT } from '../../lib/api';
import type { DownloadPayload } from '../../types/store';

export function DownloadFileList({ payload, token }: { payload: DownloadPayload; token: string }) {
  const files = payload.files?.length
    ? payload.files
    : payload.fileName
      ? [{ id: 'primary', fileName: payload.fileName, sortOrder: 0 }]
      : [];

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="download-file-list">
      {files.map((file) => (
        <a key={file.id} className="primary-link" href={`${API_ROOT}/downloads/${token}/file/${file.id}`}>
          <span>{file.label?.trim() || file.fileName}</span>
        </a>
      ))}
    </div>
  );
}
