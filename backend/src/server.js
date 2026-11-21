const env = require('./config/env');
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const { User } = require('./models/User');
const { seedDatabase } = require('./seed/seed');

const startServer = async () => {
  try {
    const { isMemoryFallback } = await connectDB();

    // Auto-seed sample users only in non-production when database is empty and SEED_* vars are configured
    if (env.nodeEnv !== 'production' && env.seed.adminEmail && env.seed.adminPassword) {
      const existingUsers = await User.countDocuments();
      if (existingUsers === 0) {
        const seeded = await seedDatabase({ clearExisting: false });
        console.log(
          `[Bootstrap] Auto-seeded ${seeded.usersCount} sample users (${
            isMemoryFallback ? 'embedded dev DB' : 'empty local DB'
          }) from backend/.env.`
        );
      }
    }

    const server = app.listen(env.port, () => {
      console.log(`[Server] Running in ${env.nodeEnv} mode on http://localhost:${env.port}`);
    });

    server.on('error', async (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `[Server] Port ${env.port} is already in use. Stop the existing process on port ${env.port} or update PORT in backend/.env.`
        );
      } else {
        console.error('[Server] HTTP server error:', err.message);
      }
      await disconnectDB();
      process.exit(1);
    });

    const shutdown = async () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[Server] Startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
