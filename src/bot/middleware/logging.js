/**
 * Request logging middleware
 * @param {import('pino').Logger} logger - Pino logger instance
 * @returns {Function} Middleware function
 */
const createLoggingMiddleware = (logger) => {
  /**
   * Logs incoming messages and callback queries
   * @param {Object} ctx - Telegraf context
   * @param {Function} next - Next middleware function
   */
  const loggingMiddleware = async (ctx, next) => {
    const startTime = Date.now();

    const logData = {
      telegram_id: ctx.from?.id,
      username: ctx.from?.username,
      chat_id: ctx.chat?.id,
      chat_type: ctx.chat?.type,
    };

    // Log message type
    if (ctx.message) {
      if (ctx.message.text) {
        logData.message_type = 'text';
        logData.message_text = ctx.message.text;
      } else if (ctx.message.callback_query) {
        logData.message_type = 'callback';
      } else {
        logData.message_type = Object.keys(ctx.message).find((k) => k !== 'from' && k !== 'chat' && k !== 'date' && k !== 'message_id');
      }
    } else if (ctx.callbackQuery) {
      logData.message_type = 'callback_query';
      logData.callback_data = ctx.callbackQuery.data;
    }

    logger.info(logData, 'Incoming request');

    await next();

    const duration = Date.now() - startTime;
    logger.info(
      {
        ...logData,
        duration_ms: duration,
      },
      'Request completed'
    );
  };

  return loggingMiddleware;
};

export default createLoggingMiddleware;
