import { createDateSelectionKeyboard, createSubjectFilterKeyboard } from '../keyboards/main.js';
import { formatHomeworkList, getUniqueSubjects } from '../../utils/formatters.js';
import { getTodayRange, getTomorrowRange, getWeekRange, getNextWeekRange } from '../../utils/date.js';

/**
 * Creates homework command handlers
 * @param {Object} apiClient - API client instance
 * @param {Object} models - Database models
 * @param {number} adminId - Admin Telegram ID
 * @returns {Object} Homework handlers
 */
const createHomeworkHandlers = (apiClient, models, adminId) => {
  // Store user preferences in memory (could be moved to database)
  const userPreferences = new Map();

  /**
   * Handles /homework command
   * @param {Object} ctx - Telegraf context
   */
  const homeworkCommandHandler = async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    await ctx.reply(
      '📚 <b>Homework</b>\n\n' +
        'Select a date range to view homework:',
      {
        parse_mode: 'HTML',
        ...createDateSelectionKeyboard(),
      }
    );
  };

  /**
   * Handles date selection callbacks
   * @param {Object} ctx - Telegraf context
   */
  const dateCallbackHandler = async (ctx) => {
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

    await fetchAndSendHomework(ctx, dateRange, periodName, null, telegramId);
  };

  /**
   * Handles subject filter callbacks
   * @param {Object} ctx - Telegraf context
   */
  const subjectCallbackHandler = async (ctx) => {
    const data = ctx.callbackQuery?.data;
    const telegramId = ctx.from?.id;

    if (!data || !telegramId || !data.startsWith('subject_filter_')) return;

    await ctx.answerCbQuery();

    const subject = data.replace('subject_filter_', '');
    const prefs = userPreferences.get(telegramId) || {};

    if (prefs.selectedSubject === subject) {
      prefs.selectedSubject = null; // Toggle off
    } else {
      prefs.selectedSubject = subject;
    }

    userPreferences.set(telegramId, prefs);

    // Re-fetch homework with new filter
    const dateRange = prefs.dateRange || getTodayRange();
    const periodName = prefs.periodName || 'today';

    await fetchAndSendHomework(ctx, dateRange, periodName, prefs.selectedSubject, telegramId);
  };

  /**
   * Fetches homework from API and sends to user
   * @param {Object} ctx - Telegraf context
   * @param {Object} dateRange - Date range object
   * @param {string} periodName - Period name for display
   * @param {string|null} filterSubject - Subject to filter by
   * @param {number} telegramId - Telegram user ID
   */
  const fetchAndSendHomework = async (ctx, dateRange, periodName, filterSubject, telegramId) => {
    try {
      // Get student ID (could be stored per user in database)
      const studentId = await getStudentIdForUser(telegramId);

      if (!studentId) {
        await ctx.editMessageText(
          '⚠️ <b>No Student Linked</b>\n\n' +
            'Please contact the administrator to link your account to a student.',
          { parse_mode: 'HTML' }
        );
        return;
      }

      const homeworks = await apiClient.getHomework(studentId, dateRange.from, dateRange.to);

      if (!homeworks || homeworks.length === 0) {
        await ctx.editMessageText(
          `📭 <b>No Homework</b>\n\n` +
            `No homework assignments found for ${periodName}.\n\n` +
            `Select a different date range to view homework.`,
          {
            parse_mode: 'HTML',
            ...createDateSelectionKeyboard(),
          }
        );
        return;
      }

      // Store preferences for future filtering
      const prefs = userPreferences.get(telegramId) || {};
      prefs.dateRange = dateRange;
      prefs.periodName = periodName;
      userPreferences.set(telegramId, prefs);

      const subjects = getUniqueSubjects(homeworks);
      const filteredMessage = filterSubject ? ` (filtered by ${filterSubject})` : '';

      await ctx.editMessageText(
        `📚 <b>Homework for ${periodName}</b>${filteredMessage}\n\n` +
          formatHomeworkList(homeworks, filterSubject),
        {
          parse_mode: 'HTML',
          ...createSubjectFilterKeyboard(subjects, filterSubject),
        }
      );
    } catch (error) {
      console.error('Error fetching homework:', error);
      await ctx.editMessageText(
        '❌ <b>Error</b>\n\n' +
          'Failed to fetch homework. Please try again later.\n\n' +
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
    // For now, fetch the first available student
    try {
      const studentId = await apiClient.getFirstStudent();
      return studentId;
    } catch (error) {
      console.error('Error getting student ID:', error);
      return null;
    }
  };

  return {
    homeworkCommandHandler,
    dateCallbackHandler,
    subjectCallbackHandler,
  };
};

export default createHomeworkHandlers;
