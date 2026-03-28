import { createMainMenu } from '../keyboards/main.js';

/**
 * Creates the /start command handler
 * @param {Object} models - Database models
 * @param {number} adminId - Admin Telegram ID
 * @returns {Function} Handler function
 */
const createStartHandler = (models, adminId) => {
  const { User } = models;

  /**
   * Handles /start command
   * @param {Object} ctx - Telegraf context
   */
  const startHandler = async (ctx) => {
    const telegramId = ctx.from?.id;

    if (!telegramId) return;

    try {
      // Register or update user
      const user = await User.createOrUpdate(telegramId, {
        username: ctx.from.username,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
      });

      const isAdmin = telegramId === adminId;
      const hasAccess = user?.has_access || isAdmin;

      const welcomeMessage = isAdmin
        ? `👋 <b>Welcome, Admin!</b>\n\nYou have full access to all features.`
        : hasAccess
        ? `👋 <b>Welcome!</b>\n\nYour access is confirmed. You can now use all features.`
        : `👋 <b>Welcome!</b>\n\n⚠️ You need an access key to use this bot. Use /key command to enter your key.`;

      await ctx.reply(welcomeMessage, {
        parse_mode: 'HTML',
        reply_markup: createMainMenu().reply_markup,
      });
    } catch (error) {
      // Re-throw to be caught by bot.catch
      throw new Error(`Database error in startHandler: ${error.message}`);
    }
  };

  /**
   * Handles help command
   * @param {Object} ctx - Telegraf context
   */
  const helpHandler = async (ctx) => {
    const helpText = `📖 <b>Homework Bot Help</b>

<b>Available Commands:</b>
/start - Start the bot and see main menu
/key - Enter your access key
/homework - View homework assignments
/schedule - View class schedule

<b>Features:</b>
• View homework for today, tomorrow, or any week
• Filter homework by subject
• View class schedule with times and rooms
• Beautiful formatted messages

<b>Need an access key?</b>
Contact the bot administrator to get your unique access key.

<b>Admin Commands:</b>
/admin - Open admin panel (admins only)`;

    await ctx.reply(helpText, {
      parse_mode: 'HTML',
      reply_markup: createMainMenu().reply_markup,
    });
  };

  return { startHandler, helpHandler };
};

export default createStartHandler;
