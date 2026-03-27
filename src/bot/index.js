import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Telegraf } = require('telegraf');
import { SocksProxyAgent } from 'socks-proxy-agent';
import createLoggingMiddleware from './middleware/logging.js';
import createAuthMiddleware from './middleware/auth.js';
import createStartHandler from './handlers/start.js';
import createAccessHandler from './handlers/access.js';
import createAdminHandlers from './handlers/admin.js';
import createHomeworkHandlers from './handlers/homework.js';
import createScheduleHandlers from './handlers/schedule.js';

/**
 * Creates and configures the Telegram bot
 * @param {Object} config - Configuration object
 * @param {Object} models - Database models
 * @param {Object} apiClient - API client instance
 * @param {import('pino').Logger} logger - Logger instance
 * @returns {Telegraf} Configured bot instance
 */
const createBot = ({ config, models, apiClient, logger }) => {
  const { bot: botConfig, proxy, admin } = config;

  // Configure proxy for Telegram requests if specified
  let telegrafOptions = {
    handlerTimeout: 30,
  };

  if (proxy?.host && proxy?.port) {
    let proxyUrl = `socks5://${proxy.host}:${proxy.port}`;
    if (proxy.user && proxy.pass) {
      proxyUrl = `socks5://${encodeURIComponent(proxy.user)}:${encodeURIComponent(proxy.pass)}@${proxy.host}:${proxy.port}`;
    }
    logger.info({ host: proxy.host, port: proxy.port }, 'Using SOCKS5 proxy for Telegram');
    const agent = new SocksProxyAgent(proxyUrl);
    // Telegraf v4: pass agent in telegram options
    telegrafOptions.telegram = {
      agent,
      timeout: 60000,
    };
  }

  const bot = new Telegraf(botConfig.token, telegrafOptions);

  // Create middleware
  const loggingMiddleware = createLoggingMiddleware(logger);
  const { authMiddleware, adminOnly } = createAuthMiddleware(models, admin.id);

  // Create handlers
  const { startHandler, helpHandler } = createStartHandler(models, admin.id);
  const { keyCommandHandler, keySubmissionHandler, cancelHandler } = createAccessHandler(models);
  const {
    adminCommandHandler,
    generateKeyHandler,
    adminStatsHandler,
    adminUsersHandler,
    adminCallbackHandler,
  } = createAdminHandlers(models, admin.id);
  const { homeworkCommandHandler, dateCallbackHandler, subjectCallbackHandler } =
    createHomeworkHandlers(apiClient, models, admin.id);
  const { scheduleCommandHandler, scheduleDateCallbackHandler } = createScheduleHandlers(
    apiClient,
    models
  );

  // Global error handler
  bot.catch((ctx, error) => {
    // Telegraf passes (ctx, error) not (error, ctx)
    const err = error || ctx?.error;
    logger.error(
      {
        error_message: err?.message || 'Unknown error',
        error_stack: err?.stack || 'No stack trace',
        telegram_id: ctx?.from?.id,
        username: ctx?.from?.username,
        chat_id: ctx?.chat?.id,
        update_type: ctx?.updateType,
      },
      'Bot error'
    );
    if (ctx?.reply) {
      ctx.reply('❌ An error occurred. Please try again later.');
    }
  });

  // Logging middleware (applies to all updates)
  bot.use(loggingMiddleware);

  // Session middleware (simple in-memory session)
  bot.use(async (ctx, next) => {
    ctx.session = ctx.session || {};
    await next();
  });

  // Commands available to all users (even without access)
  bot.command('start', startHandler);
  bot.command('help', helpHandler);
  bot.command('key', keyCommandHandler);
  bot.command('cancel', cancelHandler);

  // Admin commands
  bot.command('admin', adminCommandHandler);

  // Message handler for access key submission
  bot.on('text', async (ctx, next) => {
    // Check if user is waiting for key input
    if (ctx.session?.waitingForKey) {
      await keySubmissionHandler(ctx);
      return;
    }
    await next();
  });

  // Callback query handler for admin menu
  bot.on('callback_query', async (ctx, next) => {
    const data = ctx.callbackQuery?.data;

    if (!data) return next();

    // Admin callbacks
    if (data.startsWith('admin_') || data.startsWith('copy_key_')) {
      await adminCallbackHandler(ctx);
      return;
    }

    await next();
  });

  // Protected routes (require access)
  bot.use(authMiddleware);

  // Protected commands
  bot.command('homework', homeworkCommandHandler);
  bot.command('schedule', scheduleCommandHandler);

  // Protected callback handlers
  bot.on('callback_query', async (ctx, next) => {
    const data = ctx.callbackQuery?.data;

    if (!data) return next();

    // Date selection callbacks
    if (data.startsWith('date_')) {
      // Check if it's a homework or schedule context
      if (ctx.session?.context === 'schedule') {
        await scheduleDateCallbackHandler(ctx);
      } else {
        await dateCallbackHandler(ctx);
      }
      return;
    }

    // Subject filter callbacks
    if (data.startsWith('subject_') || data.startsWith('quick_subject_')) {
      await subjectCallbackHandler(ctx);
      return;
    }

    await next();
  });

  return bot;
};

export default createBot;
