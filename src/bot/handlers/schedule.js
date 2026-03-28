import { createDateSelectionKeyboard } from '../keyboards/main.js';
import { formatScheduleList } from '../../utils/formatters.js';
import { getTodayRange, getTomorrowRange, getWeekRange, getNextWeekRange, getDateRange } from '../../utils/date.js';

/**
 * Creates schedule command handlers
 * @param {Object} apiClient - API client instance
 * @param {Object} models - Database models
 * @returns {Object} Schedule handlers
 */
const createScheduleHandlers = (apiClient, models) => {
  /**
   * Handles /schedule command
   * @param {Object} ctx - Telegraf context
   */
  const scheduleCommandHandler = async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    await ctx.reply(
      '📅 <b>Schedule</b>\n\n' +
        'Select a date range to view the class schedule:',
      {
        parse_mode: 'HTML',
        ...createDateSelectionKeyboard(),
      }
    );
  };

  /**
   * Handles date selection callbacks for schedule
   * @param {Object} ctx - Telegraf context
   */
  const scheduleDateCallbackHandler = async (ctx) => {
    const data = ctx.callbackQuery?.data;
    const telegramId = ctx.from?.id;

    if (!data || !telegramId) return;

    await ctx.answerCbQuery();

    let dateRange;
    let periodName;

    switch (data) {
      case 'date_today':
        dateRange = getTodayRange();
        periodName = 'today';
        break;
      case 'date_tomorrow':
        dateRange = getTomorrowRange();
        periodName = 'tomorrow';
        break;
      case 'date_week':
        dateRange = getWeekRange();
        periodName = 'this week';
        break;
      case 'date_next_week':
        dateRange = getNextWeekRange();
        periodName = 'next week';
        break;
      case 'date_back':
        return;
      default:
        return;
    }

    await fetchAndSendSchedule(ctx, dateRange, periodName, telegramId);
  };

  /**
   * Fetches schedule from API and sends to user
   * @param {Object} ctx - Telegraf context
   * @param {Object} dateRange - Date range object
   * @param {string} periodName - Period name for display
   * @param {number} telegramId - Telegram user ID
   */
  const fetchAndSendSchedule = async (ctx, dateRange, periodName, telegramId) => {
    try {
      // Get student ID
      const studentId = await getStudentIdForUser(telegramId);

      if (!studentId) {
        await ctx.editMessageText(
          '⚠️ <b>No Student Linked</b>\n\n' +
            'Please contact the administrator to link your account to a student.',
          { parse_mode: 'HTML' }
        );
        return;
      }

      // Get dates array for schedule
      const dates = getDateRange(dateRange.from, dateRange.to);

      const schedule = await apiClient.getSchedule(studentId, dates);

      if (!schedule || schedule.length === 0) {
        await ctx.editMessageText(
          `📭 <b>No Schedule</b>\n\n` +
            `No classes found for ${periodName}.\n\n` +
            `Select a different date range to view the schedule.`,
          {
            parse_mode: 'HTML',
            ...createDateSelectionKeyboard(),
          }
        );
        return;
      }

      await ctx.editMessageText(
        `📅 <b>Schedule for ${periodName}</b>\n\n` +
          formatScheduleList(schedule),
        {
          parse_mode: 'HTML',
          ...createDateSelectionKeyboard(),
        }
      );
    } catch (error) {
      console.error('Error fetching schedule:', error);
      await ctx.editMessageText(
        '❌ <b>Error</b>\n\n' +
          'Failed to fetch schedule. Please try again later.\n\n' +
          `Error: ${error.message}`,
        {
          parse_mode: 'HTML',
          ...createDateSelectionKeyboard(),
        }
      );
    }
  };

  /**
   * Gets the student ID for a user
   * @param {number} telegramId - Telegram user ID
   * @returns {Promise<string|null>} Student ID
   */
  const getStudentIdForUser = async (telegramId) => {
    // TODO: Store student IDs in database per user
    try {
      const studentId = await apiClient.getFirstStudent();
      return studentId;
    } catch (error) {
      console.error('Error getting student ID:', error);
      return null;
    }
  };

  return {
    scheduleCommandHandler,
    scheduleDateCallbackHandler,
  };
};

export default createScheduleHandlers;
