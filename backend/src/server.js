const env = require('./config/env');
const { connectDB } = require('./config/db');
const createApp = require('./app');

async function start() {
  try {
    await connectDB(env.mongoUri);
    console.log('MongoDB connected');
    createApp().listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
