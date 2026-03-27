/**
 * Formats a homework item into a readable HTML message
 * @param {Object} homework - Homework object from API
 * @returns {string} Formatted HTML string
 */
export const formatHomework = (homework) => {
  const {
    subject_name = 'Unknown Subject',
    task_text = 'No description',
    due_date,
    status = 'unknown',
  } = homework;

  const statusEmoji = {
    assigned: '📋',
    completed: '✅',
    overdue: '⚠️',
    unknown: '📝',
  };

  const dueDate = due_date ? new Date(due_date).toLocaleDateString('ru-RU') : 'No due date';

  return `<b>📚 ${escapeHtml(subject_name)}</b>
${statusEmoji[status] || statusEmoji.unknown} <b>Due:</b> ${dueDate}
<b>Status:</b> ${capitalizeFirst(status)}

${escapeHtml(task_text)}`;
};

/**
 * Formats a schedule item into a readable HTML message
 * @param {Object} lesson - Lesson object from API
 * @returns {string} Formatted HTML string
 */
export const formatSchedule = (lesson) => {
  const {
    subject_name = 'Unknown Subject',
    room,
    start_time,
    end_time,
    teacher_name,
  } = lesson;

  const startTime = start_time ? formatTime(start_time) : 'N/A';
  const endTime = end_time ? formatTime(end_time) : 'N/A';

  let message = `<b>📖 ${escapeHtml(subject_name)}</b>
⏰ <b>Time:</b> ${startTime} - ${endTime}`;

  if (room) {
    message += `\n🚪 <b>Room:</b> ${escapeHtml(room)}`;
  }

  if (teacher_name) {
    message += `\n👨‍🏫 <b>Teacher:</b> ${escapeHtml(teacher_name)}`;
  }

  return message;
};

/**
 * Formats a list of homework items with subject filtering
 * @param {Array} homeworks - Array of homework objects
 * @param {string|null} filterSubject - Subject to filter by (optional)
 * @returns {string} Formatted HTML string
 */
export const formatHomeworkList = (homeworks, filterSubject = null) => {
  if (!homeworks || homeworks.length === 0) {
    return '📭 No homework found for the selected period.';
  }

  let filtered = homeworks;
  if (filterSubject) {
    filtered = homeworks.filter((h) => h.subject_name === filterSubject);
  }

  if (filtered.length === 0) {
    return `📭 No homework found for "${filterSubject}" in the selected period.`;
  }

  const grouped = groupBySubject(filtered);
  let message = '<b>📋 Homework Assignments</b>\n\n';

  for (const [subject, items] of Object.entries(grouped)) {
    message += `<b>📚 ${escapeHtml(subject)}</b>\n`;
    for (const item of items) {
      const dueDate = item.due_date ? new Date(item.due_date).toLocaleDateString('ru-RU') : 'No date';
      const statusIcon = item.status === 'completed' ? '✅' : '⬜';
      message += `  ${statusIcon} Due: ${dueDate}\n`;
      const preview = (item.task_text || 'No description').substring(0, 50);
      message += `     ${escapeHtml(preview)}${item.task_text?.length > 50 ? '...' : ''}\n\n`;
    }
  }

  return message.trim();
};

/**
 * Formats a schedule list for a date range
 * @param {Array} schedule - Array of schedule objects
 * @returns {string} Formatted HTML string
 */
export const formatScheduleList = (schedule) => {
  if (!schedule || schedule.length === 0) {
    return '📭 No schedule found for the selected dates.';
  }

  const grouped = groupByDate(schedule);
  let message = '<b>📅 Class Schedule</b>\n\n';

  for (const [date, lessons] of Object.entries(grouped)) {
    const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    message += `<b>🗓️ ${capitalizeFirst(formattedDate)}</b>\n`;

    for (const lesson of lessons) {
      const time = lesson.start_time ? formatTime(lesson.start_time) : 'N/A';
      message += `  ⏰ ${time} - ${escapeHtml(lesson.subject_name || 'Unknown')}\n`;
    }
    message += '\n';
  }

  return message.trim();
};

/**
 * Escapes HTML special characters for Telegram HTML parsing
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formats a time string (HH:mm) to locale time
 * @param {string} timeStr - Time string in HH:mm format
 * @returns {string} Formatted time
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
};

/**
 * Groups an array by a key property
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key] || 'Unknown';
    result[group] = result[group] || [];
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Groups homework by subject
 * @param {Array} homeworks - Array of homework objects
 * @returns {Object} Grouped by subject
 */
export const groupBySubject = (homeworks) => {
  return groupBy(homeworks, 'subject_name');
};

/**
 * Groups schedule items by date
 * @param {Array} schedule - Array of schedule objects
 * @returns {Object} Grouped by date
 */
export const groupByDate = (schedule) => {
  return groupBy(schedule, 'date');
};

/**
 * Extracts unique subjects from homework list
 * @param {Array} homeworks - Array of homework objects
 * @returns {Array} Unique subject names
 */
export const getUniqueSubjects = (homeworks) => {
  if (!homeworks) return [];
  const subjects = new Set(homeworks.map((h) => h.subject_name).filter(Boolean));
  return Array.from(subjects).sort();
};
