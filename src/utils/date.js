/**
 * Date utility functions for the Homework Bot
 */

/**
 * Formats a date to YYYY-MM-DD format
 * @param {Date} date - Date object (defaults to today)
 * @returns {string} Formatted date string
 */
export const formatDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export const getToday = () => {
  return formatDate(new Date());
};

/**
 * Gets tomorrow's date in YYYY-MM-DD format
 * @returns {string} Tomorrow's date
 */
export const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
};

/**
 * Gets the start of the current week (Monday)
 * @returns {string} Monday's date in YYYY-MM-DD format
 */
export const getWeekStart = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(today.setDate(diff));
  return formatDate(weekStart);
};

/**
 * Gets the end of the current week (Sunday)
 * @returns {string} Sunday's date in YYYY-MM-DD format
 */
export const getWeekEnd = () => {
  const weekStart = new Date(getWeekStart());
  weekStart.setDate(weekStart.getDate() + 6);
  return formatDate(weekStart);
};

/**
 * Gets a date range for the current week
 * @returns {Object} Object with from and to dates
 */
export const getWeekRange = () => {
  return {
    from: getWeekStart(),
    to: getWeekEnd(),
  };
};

/**
 * Gets a date range for the next week
 * @returns {Object} Object with from and to dates
 */
export const getNextWeekRange = () => {
  const weekStart = new Date(getWeekStart());
  weekStart.setDate(weekStart.getDate() + 7);
  const from = formatDate(weekStart);
  weekStart.setDate(weekStart.getDate() + 6);
  const to = formatDate(weekStart);
  return { from, to };
};

/**
 * Gets a date range for today
 * @returns {Object} Object with from and to dates (both today)
 */
export const getTodayRange = () => {
  const today = getToday();
  return { from: today, to: today };
};

/**
 * Gets a date range for tomorrow
 * @returns {Object} Object with from and to dates (both tomorrow)
 */
export const getTomorrowRange = () => {
  const tomorrow = getTomorrow();
  return { from: tomorrow, to: tomorrow };
};

/**
 * Generates an array of dates between two dates
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Array<string>} Array of date strings
 */
export const getDateRange = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

/**
 * Parses a date string and returns a Date object
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date} Date object
 */
export const parseDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Gets the display name for a date range preset
 * @param {string} preset - Preset name (today, tomorrow, week)
 * @returns {string} Display name
 */
export const getPresetDisplayName = (preset) => {
  const names = {
    today: '📅 Today',
    tomorrow: '📅 Tomorrow',
    week: '📅 This Week',
    next_week: '📅 Next Week',
    custom: '📅 Custom Range',
  };
  return names[preset] || preset;
};
