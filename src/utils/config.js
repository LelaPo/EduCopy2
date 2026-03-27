import dotenv from 'dotenv';

dotenv.config();

/**
 * Validates and returns the application configuration
 * @throws {Error} If required environment variables are missing
 * @returns {Object} Validated configuration object
 */
const loadConfig = () => {
  const required = ['BOT_TOKEN', 'API_BASE_URL', 'API_BEARER_TOKEN', 'ADMIN_ID'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const adminId = parseInt(process.env.ADMIN_ID, 10);
  if (isNaN(adminId)) {
    throw new Error('ADMIN_ID must be a valid number');
  }

  return {
    bot: {
      token: process.env.BOT_TOKEN,
    },
    api: {
      baseUrl: process.env.API_BASE_URL,
      bearerToken: process.env.API_BEARER_TOKEN,
    },
    admin: {
      id: adminId,
    },
    database: {
      path: process.env.DB_PATH || './data/homework_bot.db',
    },
    proxy: {
      host: process.env.PROXY_HOST || null,
      port: process.env.PROXY_PORT ? parseInt(process.env.PROXY_PORT, 10) : null,
      user: process.env.PROXY_USER || null,
      pass: process.env.PROXY_PASS || null,
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
    },
  };
};

export default loadConfig;
