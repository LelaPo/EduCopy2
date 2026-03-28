import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Markup } = require('telegraf');

/**
 * Creates the main menu keyboard
 * @returns {Object} Main menu inline keyboard
 */
export const createMainMenu = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📚 Homework', 'menu_homework')],
    [Markup.button.callback('📅 Schedule', 'menu_schedule')],
    [Markup.button.callback('📊 My Stats', 'menu_stats')],
    [Markup.button.callback('ℹ️ Help', 'menu_help')],
  ]);
};

/**
 * Creates the admin menu keyboard
 * @returns {Object} Admin menu inline keyboard
 */
export const createAdminMenu = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔑 Generate Key', 'admin_generate_key')],
    [Markup.button.callback('📊 Statistics', 'admin_stats')],
    [Markup.button.callback('👥 Users', 'admin_users'), Markup.button.callback('🔙 Back', 'admin_back')],
  ]);
};

/**
 * Creates a keyboard for date range selection
 * @returns {Object} Date selection keyboard
 */
export const createDateSelectionKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📅 Today', 'date_today'), Markup.button.callback('📅 Tomorrow', 'date_tomorrow')],
    [Markup.button.callback('📆 This Week', 'date_week'), Markup.button.callback('📆 Next Week', 'date_next_week')],
    [Markup.button.callback('🔙 Back', 'date_back')],
  ]);
};

/**
 * Creates a keyboard with subject filters
 * @param {Array<string>} subjects - List of subjects
 * @param {string} selectedSubject - Currently selected subject
 * @returns {Object} Subject filter keyboard
 */
export const createSubjectFilterKeyboard = (subjects, selectedSubject = null) => {
  const buttons = [];

  for (const subject of subjects) {
    const prefix = selectedSubject === subject ? '✅ ' : '▫️ ';
    buttons.push(Markup.button.callback(`${prefix}${subject}`, `subject_filter_${subject}`));
  }

  // Create rows of 2 buttons each
  const keyboard = [];
  for (let i = 0; i < buttons.length; i += 2) {
    keyboard.push(buttons.slice(i, i + 2));
  }

  keyboard.push([
    Markup.button.callback('🗑️ Clear Filter', 'subject_clear'),
    Markup.button.callback('🔙 Back', 'subject_back'),
  ]);

  return Markup.inlineKeyboard(keyboard);
};

/**
 * Creates a keyboard for custom date range input
 * @returns {Object} Custom date keyboard
 */
export const createCustomDateKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Back', 'custom_date_back')],
  ]);
};

/**
 * Creates a confirmation keyboard for key generation
 * @param {string} key - Generated key
 * @returns {Object} Confirmation keyboard
 */
export const createKeyGeneratedKeyboard = (key) => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔑 Generate Another', 'admin_generate_key')],
    [Markup.button.callback('📋 Copy Key', `copy_key_${key}`), Markup.button.callback('🔙 Back', 'admin_back')],
  ]);
};

/**
 * Creates a back button keyboard
 * @param {string} callback - Callback data for back button
 * @returns {Object} Back keyboard
 */
export const createBackKeyboard = (callback = 'menu_back') => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Back', callback)],
  ]);
};
