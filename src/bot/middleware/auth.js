/**
 * Authentication and access control middleware
 * @param {Object} models - Database models
 * @param {number} adminId - Admin Telegram ID
 * @returns {Function} Middleware function
 */
const createAuthMiddleware = (models, adminId) => {
  const { User } = models;

  /**
   * Checks if user has access to the bot
   * @param {Object} ctx - Telegraf context
   * @param {Function} next - Next middleware function
   */
  const authMiddleware = async (ctx, next) => {
    const telegramId = ctx.from?.id;

    if (!telegramId) {
      return;
    }

    // Admin always has access
    if (telegramId === adminId) {
      return next();
    }

    // Check if user exists and has access
    const user = User.findById(telegramId);

    if (!user) {
      // Register new user without access
      User.createOrUpdate(telegramId, {
        username: ctx.from.username,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
      });
      return ctx.reply(
        '🔐 <b>Access Required</b>\n\n' +
          'This bot requires an access key to use. ' +
          'Please enter your access key to continue.',
        { parse_mode: 'HTML' }
      );
    }

    if (!user.has_access) {
      return ctx.reply(
        '⛔ <b>Access Denied</b>\n\n' +
          'Your access key has not been validated yet. ' +
          'Please enter a valid access key to continue.',
        { parse_mode: 'HTML' }
      );
    }

    // Update user info
    User.createOrUpdate(telegramId, {
      username: ctx.from.username,
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name,
    });

    return next();
  };

  /**
   * Checks if user is admin
   * @param {Object} ctx - Telegraf context
   * @param {Function} next - Next middleware function
   */
  const adminOnly = async (ctx, next) => {
    const telegramId = ctx.from?.id;

    if (telegramId === adminId) {
      return next();
    }

    await ctx.answerCbQuery('⛔ Admin access required', { show_alert: true });
  };

  return {
    authMiddleware,
    adminOnly,
  };
};

export default createAuthMiddleware;
