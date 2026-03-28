/**
 * Creates the access key handler
 * @param {Object} models - Database models
 * @returns {Function} Handler function
 */
const createAccessHandler = (models) => {
  const { User, AccessKey } = models;

  /**
   * Handles /key command - prompt for access key
   * @param {Object} ctx - Telegraf context
   */
  const keyCommandHandler = async (ctx) => {
    await ctx.reply(
      '🔑 <b>Enter Access Key</b>\n\n' +
        'Please send your access key as a message.\n' +
        'The key should be a 12-character code.\n\n' +
        'Send /cancel to cancel.',
      { parse_mode: 'HTML' }
    );

    // Set up one-time listener for the key
    ctx.session = ctx.session || {};
    ctx.session.waitingForKey = true;
  };

  /**
   * Handles access key submission
   * @param {Object} ctx - Telegraf context
   */
  const keySubmissionHandler = async (ctx) => {
    const telegramId = ctx.from?.id;
    const messageText = ctx.message?.text?.trim();

    if (!telegramId || !messageText) return;

    // Check if in key entry mode
    if (!ctx.session?.waitingForKey) return;

    // Validate key format (basic check)
    if (messageText.length < 6 || messageText.length > 16) {
      await ctx.reply(
        '❌ <b>Invalid Key Format</b>\n\n' +
          'Access keys are typically 12 characters long.\n' +
          'Please check your key and try again.\n\n' +
          'Send /cancel to cancel.',
        { parse_mode: 'HTML' }
      );
      return;
    }

    // Try to validate and use the key
    const keyData = await AccessKey.validateAndUse(messageText.toUpperCase(), telegramId);

    if (!keyData) {
      await ctx.reply(
        '❌ <b>Invalid or Used Key</b>\n\n' +
          'This access key is either invalid or has already been used.\n' +
          'Please contact the administrator for a new key.\n\n' +
          'Send /cancel to cancel.',
        { parse_mode: 'HTML' }
      );
      return;
    }

    // Grant access to user
    await User.grantAccess(telegramId);

    ctx.session.waitingForKey = false;

    await ctx.reply(
      '✅ <b>Access Granted!</b>\n\n' +
        'Your access key has been validated.\n' +
        'You now have full access to all bot features.\n\n' +
        'Use /start to see the main menu.',
      { parse_mode: 'HTML' }
    );
  };

  /**
   * Handles /cancel command
   * @param {Object} ctx - Telegraf context
   */
  const cancelHandler = async (ctx) => {
    ctx.session = ctx.session || {};
    ctx.session.waitingForKey = false;

    await ctx.reply('❌ Operation cancelled.');
  };

  return { keyCommandHandler, keySubmissionHandler, cancelHandler };
};

export default createAccessHandler;
