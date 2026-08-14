import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler.js';
import routes from './routes/index.js';
import adminRouter from '../../my-readiness/backend/src/routes/admin.js';
import otpRouter from '../../my-readiness/backend/src/routes/otp.js';
import readinessRouter from '../../my-readiness/backend/src/routes/readiness.js';
import ussdRouter from './routes/ussdRoutes.js';
import voiceRouter from './routes/voiceRoutes.js';
import atRouter from './routes/atRoutes.js';

const app = express();

// ---------------------
// Global Middleware
// ---------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------
// Health Check
// ---------------------
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ---------------------
// API Routes
// ---------------------
// AT callbacks first so they never fall through to JSON 404.
app.use('/api/ussd', ussdRouter);
app.use('/ussd', ussdRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/at', atRouter);
app.use('/api', routes);
app.use('/api/otp', otpRouter);
app.use('/api/admin', adminRouter);
app.use('/api/readiness', readinessRouter);

// ---------------------
// 404 Handler
// ---------------------
app.use((req, res) => {
  const url = String(req.originalUrl || '');
  if (/^\/(api\/)?ussd\/?/i.test(url.split('?')[0])) {
    res.status(200);
    res.set('Content-Type', 'text/plain; charset=utf-8');
    return res.send('END Lima na Loop USSD is live.');
  }
  res.status(404).json({ success: false, error: { message: 'Route not found' } });
});

// ---------------------
// Global Error Handler
// ---------------------
app.use(errorHandler);

export default app;
