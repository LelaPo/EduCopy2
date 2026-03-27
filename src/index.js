import createLogger from './utils/logger.js';
import loadConfig from './utils/config.js';
import initDatabase from './database/index.js';
import createUserModel from './database/models/User.js';
import createAccessKeyModel from './database/models/AccessKey.js';
import createApiClient from './api/client.js';
import createBot from './bot/index.js';

/**
 * Main application entry point
 */
const main = async () => {
  let bot;
  let db;

  try {
    // Load and validate configuration
    console.log('🚀 Starting Homework Bot...');
    const config = loadConfig();

    // Initialize logger
    const logger = createLogger(config.logging.level);
    logger.info('Configuration loaded successfully');

    // Initialize database
    db = initDatabase(config.database.path);
    logger.info({ path: config.database.path }, 'Database initialized');

    // Initialize models
    const models = {
      User: createUserModel(db),
      AccessKey: createAccessKeyModel(db),
    };
    logger.info('Database models initialized');

    // Initialize API client
    const apiClient = createApiClient({
      baseUrl: config.api.baseUrl,
      bearerToken: config.api.bearerToken,
      proxy: config.proxy,
      onTokenExpired: () => {
        logger.warn('API Bearer token expired');
      },
    });
    logger.info('API client initialized');

    // Initialize and start bot
    bot = createBot({ config, models, apiClient, logger });

    // Graceful shutdown handlers
    const shutdown = async (signal) => {
      logger.info({ signal }, 'Shutdown signal received');

      try {
        if (bot) {
          await bot.stop('Shutdown');
          logger.info('Bot stopped gracefully');
        }
      } catch (error) {
        logger.error({ error }, 'Error during bot shutdown');
      }

      try {
        if (db) {
          db.close();
          logger.info('Database connection closed');
        }
      } catch (error) {
        logger.error({ error }, 'Error during database shutdown');
      }

      logger.info('Shutdown complete');
      process.exit(0);
    };

    // Register shutdown handlers
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error({ error }, 'Uncaught exception');
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ reason }, 'Unhandled rejection at ' + promise);
    });

    // Start the bot
    const botInfo = await bot.telegram.getMe();
    bot.botInfo = botInfo;
    logger.info({ username: botInfo.username }, 'Bot authenticated with Telegram');

    await bot.launch({
      dropPendingUpdates: false,
    });

    logger.info({ username: botInfo.username }, 'Bot is now running and ready to receive updates');
    console.log(`✅ Bot started successfully as @${botInfo.username}`);
    console.log('Press Ctrl+C to stop the bot');
  } catch (error) {
    console.error('❌ Failed to start bot:', error.message);

    // Try to log with logger if available
    if (error.stack) {
      console.error(error.stack);
    }

    // Cleanup
    if (db) {
      try {
        db.close();
      } catch (e) {
        // Ignore close errors
      }
    }

    if (bot) {
      try {
        await bot.stop('Error');
      } catch (e) {
        // Ignore stop errors
      }
    }

    process.exit(1);
  }
};

// Start the application
main();
