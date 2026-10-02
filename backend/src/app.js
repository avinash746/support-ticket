const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const ticketRoutes = require('./routes/ticketRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigins }));
  app.use(express.json({ limit: '100kb' }));
  if (env.nodeEnv !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/tickets', ticketRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
