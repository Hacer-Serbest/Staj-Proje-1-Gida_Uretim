const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Gıda Üretim Kontrol Sistemi API çalışıyor.',
    env: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
