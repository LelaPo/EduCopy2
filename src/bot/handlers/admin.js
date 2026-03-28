import { createAdminMenu, createKeyGeneratedKeyboard } from '../keyboards/main.js';

/**
 * Creates admin command handlers
 * @param {Object} models - Database models
 * @param {number} adminId - Admin Telegram ID
 * @returns {Object} Admin handlers
 */
const createAdminHandlers = (models, adminId) => {
  const { User, AccessKey } = models;

  /**
   * Handles /admin command
   * @param {Object} ctx - Telegraf context
   */
  const adminCommandHandler = async (ctx) => {
    if (ctx.from?.id !== adminId) {
      await ctx.reply('⛔ Admin access required.');
      return;
    }

    const stats = {
      totalUsers: await User.getCount(),
      usersWithAccess: await User.getAccessedCount(),
      unusedKeys: await AccessKey.getUnusedCount(),
      usedKeys: await AccessKey.getUsedCount(),
    };

    const adminText = `👨‍💼 <b>Admin Panel</b>

<b>📊 Statistics:</b>
• Total Users: ${stats.totalUsers}
• Users with Access: ${stats.usersWithAccess}
• Unused Keys: ${stats.unusedKeys}
• Used Keys: ${stats.usedKeys}

<b>Available Actions:</b>
Use the buttons below to manage access keys and view users.`;

    await ctx.reply(adminText, {
      parse_mode: 'HTML',
      reply_markup: createAdminMenu().reply_markup,
    });
  };

  /**
   * Handles access key generation
   * @param {Object} ctx - Telegraf context
   */
  const generateKeyHandler = async (ctx) => {
    if (ctx.from?.id !== adminId) {
      await ctx.answerCbQuery('⛔ Admin access required', { show_alert: true });
      return;
    }

    const newKey = await AccessKey.generate();

    await ctx.reply(
      `✅ <b>Access Key Generated</b>\n\n` +
        `Key: <code>${newKey}</code>\n\n` +
        `Send this key to the user. They can enter it using the /key command.\n\n` +
        `⚠️ This key can only be used once.`,
      {
        parse_mode: 'HTML',
        reply_markup: createKeyGeneratedKeyboard(newKey).reply_markup,
      }
    );
  };

  /**
   * Handles admin statistics view
   * @param {Object} ctx - Telegraf context
   */
  const adminStatsHandler = async (ctx) => {
    if (ctx.from?.id !== adminId) {
      await ctx.answerCbQuery('⛔ Admin access required', { show_alert: true });
      return;
    }

    const totalUsers = await User.getCount();
    const usersWithAccess = await User.getAccessedCount();
    const unusedKeys = await AccessKey.getUnusedCount();
    const usedKeys = await AccessKey.getUsedCount();

    const statsText = `📊 <b>Detailed Statistics</b>

<b>Users:</b>
• Total Registered: ${totalUsers}
• With Access: ${usersWithAccess}
• Without Access: ${totalUsers - usersWithAccess}

<b>Access Keys:</b>
• Generated (Unused): ${unusedKeys}
• Used: ${usedKeys}
• Total Generated: ${unusedKeys + usedKeys}

<b>Conversion Rate:</b>
${totalUsers > 0 ? Math.round((usersWithAccess / totalUsers) * 100) : 0}% of users have access`;

    await ctx.reply(statsText, {
      parse_mode: 'HTML',
      reply_markup: createAdminMenu().reply_markup,
    });
  };

  /**
   * Handles user list view
   * @param {Object} ctx - Telegraf context
   */
  const adminUsersHandler = async (ctx) => {
    if (ctx.from?.id !== adminId) {
      await ctx.answerCbQuery('⛔ Admin access required', { show_alert: true });
      return;
    }

    const users = await User.getAll();

    if (users.length === 0) {
      await ctx.reply('👥 No users registered yet.');
      return;
    }

    let usersText = `👥 <b>All Users</b> (${users.length})\n\n`;

    for (const user of users.slice(0, 20)) {
      const status = user.has_access ? '✅' : '⏳';
      const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown';
      const username = user.username ? `@${user.username}` : '';
      const joinedDate = new Date(user.created_at).toLocaleDateString('ru-RU');

      usersText += `${status} <b>${escapeHtml(name)}</b> ${username}\n`;
      usersText += `   ID: ${user.telegram_id} | Joined: ${joinedDate}\n\n`;
    }

    if (users.length > 20) {
      usersText += `\n... and ${users.length - 20} more users`;
    }

    await ctx.reply(usersText, {
      parse_mode: 'HTML',
      reply_markup: createAdminMenu().reply_markup,
    });
  };

  /**
   * Handles callback queries from admin menu
   * @param {Object} ctx - Telegraf context
   */
  const adminCallbackHandler = async (ctx) => {
    const data = ctx.callbackQuery?.data;

    if (!data || ctx.from?.id !== adminId) return;

    await ctx.answerCbQuery();

    switch (data) {
      case 'admin_generate_key':
        await generateKeyHandler(ctx);
        break;
      case 'admin_stats':
        await adminStatsHandler(ctx);
        break;
      case 'admin_users':
        await adminUsersHandler(ctx);
        break;
      case 'admin_back':
        await adminCommandHandler(ctx);
        break;
    }
  };

  return {
    adminCommandHandler,
    generateKeyHandler,
    adminStatsHandler,
    adminUsersHandler,
    adminCallbackHandler,
  };
};

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

export default createAdminHandlers;
