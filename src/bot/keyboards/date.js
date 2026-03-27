import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { InlineKeyboard } = require('telegraf');

/**
 * Creates a simple calendar for date selection
 * @param {Date} currentDate - Currently displayed month
 * @param {string} selectedDate - Selected date (YYYY-MM-DD)
 * @returns {InlineKeyboard} Calendar keyboard
 */
export const createCalendar = (currentDate = new Date(), selectedDate = null) => {
  const keyboard = new InlineKeyboard();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month navigation
  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  keyboard.text('◀️', `cal_prev_${year}_${month}`);
  keyboard.text(`${monthNames[month]} ${year}`, 'cal_ignore');
  keyboard.text('▶️', `cal_next_${year}_${month}`);
  keyboard.row();

  // Day headers
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  for (const day of days) {
    keyboard.text(day, 'cal_ignore');
  }
  keyboard.row();

  // Get first day of month and total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  // Adjust for Monday start (Russian locale)
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  // Empty cells for days before the first
  for (let i = 0; i < startDay; i++) {
    keyboard.text(' ', 'cal_ignore');
  }

  // Day buttons
  const today = new Date();
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDate(date);
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = dateStr === selectedDate;

    let label = String(day);
    if (isToday) label = `${day}*`;
    if (isSelected) label = `[${day}]`;

    keyboard.text(label, `cal_select_${dateStr}`);

    const currentDayOfWeek = date.getDay();
    if (currentDayOfWeek === 0 || day === totalDays) {
      keyboard.row();
    }
  }

  // Close button
  keyboard.text('❌ Close', 'cal_close');

  return keyboard;
};

/**
 * Formats a date to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Creates a date range selection keyboard
 * @param {string} from - Start date
 * @param {string} to - End date
 * @returns {InlineKeyboard} Date range keyboard
 */
export const createDateRangeKeyboard = (from, to) => {
  return new InlineKeyboard()
    .text(`📅 From: ${from}`, 'range_select_from')
    .text(`📅 To: ${to}`, 'range_select_to')
    .row()
    .text('✅ Apply', 'range_apply')
    .text('🔙 Back', 'range_back');
};
