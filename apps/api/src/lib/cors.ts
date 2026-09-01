import cors from 'cors';
import { buildAllowedOrigins } from './cors-origins';
import { getSettingsMap } from './settings';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

export const createCorsMiddleware = () =>
  cors({
    origin: async (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      try {
        const settings = await getSettingsMap();
        const embedOrigins = (settings.embedAllowedOrigins || '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);

        const allowed = new Set([...buildAllowedOrigins(frontendUrl), ...embedOrigins]);

        if (allowed.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error('Origin not allowed by CORS'));
      } catch (error) {
        console.error('cors origin check error', error);
        callback(null, buildAllowedOrigins(frontendUrl).has(origin));
      }
    },
    credentials: true,
  });
