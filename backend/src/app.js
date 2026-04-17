import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';
import { swaggerSpec } from './docs/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRouter from './modules/auth.js';
import usersRouter from './modules/users.js';
import hackathonsRouter from './modules/hackathons.js';
import teamsRouter from './modules/teams.js';
import messagesRouter from './modules/messages.js';
import showcaseRouter from './modules/showcase.js';
import notificationsRouter from './modules/notifications.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  const isProduction = process.env.NODE_ENV === 'production';

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-origin' },
    referrerPolicy: { policy: 'no-referrer' },
  }));

  // Logging
  app.use(morgan('dev'));

  // Rate limiting to prevent brute-force attacks
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', apiLimiter);

  app.use(cors({
    origin: isProduction
      ? (process.env.CORS_ORIGIN || '').split(',').map((item) => item.trim()).filter(Boolean)
      : true,
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));

  // Swagger Documentation Setup
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/health', (req, res) => {
    res.json({ ok: true, service: 'code-sathi-backend' });
  });

  // Serve frontend files
  app.use(express.static(path.join(__dirname, '../../frontend')));

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/hackathons', hackathonsRouter);
  app.use('/api/teams', teamsRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/showcase', showcaseRouter);
  app.use('/api/notifications', notificationsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
