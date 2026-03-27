/**
 * API endpoint definitions
 */

/**
 * Homework endpoint
 * @param {string} studentId - Student ID
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @returns {string} Full URL
 */
export const getHomeworkUrl = (studentId, from, to) => {
  return `/api/family/web/v1/homeworks?from=${from}&to=${to}&student_id=${studentId}`;
};

/**
 * Schedule endpoint
 * @param {string} studentId - Student ID
 * @param {Array<string>} dates - Array of dates (YYYY-MM-DD)
 * @returns {string} Full URL
 */
export const getScheduleUrl = (studentId, dates) => {
  const datesParam = Array.isArray(dates) ? dates.join(',') : dates;
  return `/api/family/web/v1/schedule/short?student_id=${studentId}&dates=${datesParam}`;
};

/**
 * Student list endpoint (for getting student IDs)
 * @returns {string} Full URL
 */
export const getStudentsUrl = () => {
  return '/api/family/web/v1/students';
};
