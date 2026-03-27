import Telegraf from 'telegraf';
const { InlineKeyboard } = Telegraf;

/**
 * Creates the main menu keyboard
 * @returns {InlineKeyboard} Main menu inline keyboard
 */
export const createMainMenu = () => {
  return new InlineKeyboard()
    .text('📚 Homework', 'menu_homework')
    .text('📅 Schedule', 'menu_schedule')
    .row()
    .text('📊 My Stats', 'menu_stats')
    .text('ℹ️ Help', 'menu_help');
};

/**
 * Creates the admin menu keyboard
 * @returns {InlineKeyboard} Admin menu inline keyboard
 */
export const createAdminMenu = () => {
  return new InlineKeyboard()
    .text('🔑 Generate Key', 'admin_generate_key')
    .text('📊 Statistics', 'admin_stats')
    .row()
    .text('👥 Users', 'admin_users')
    .text('🔙 Back', 'admin_back');
};

/**
 * Creates a keyboard for date range selection
 * @returns {InlineKeyboard} Date selection keyboard
 */
export const createDateSelectionKeyboard = () => {
  return new InlineKeyboard()
    .text('📅 Today', 'date_today')
    .text('📅 Tomorrow', 'date_tomorrow')
    .row()
    .text('📆 This Week', 'date_week')
    .text('📆 Next Week', 'date_next_week')
    .row()
    .text('🔙 Back', 'date_back');
};

/**
 * Creates a keyboard with subject filters
 * @param {Array<string>} subjects - List of subjects
 * @param {string} selectedSubject - Currently selected subject
 * @returns {InlineKeyboard} Subject filter keyboard
 */
export const createSubjectFilterKeyboard = (subjects, selectedSubject = null) => {
  const keyboard = new InlineKeyboard();

  for (const subject of subjects) {
    const prefix = selectedSubject === subject ? '✅ ' : '▫️ ';
    keyboard.text(`${prefix}${subject}`, `subject_filter_${subject}`);
  }

  keyboard.row();
  keyboard.text('🗑️ Clear Filter', 'subject_clear');
  keyboard.text('🔙 Back', 'subject_back');

  return keyboard;
};

/**
 * Creates a keyboard for custom date range input
 * @returns {InlineKeyboard} Custom date keyboard
 */
export const createCustomDateKeyboard = () => {
  return new InlineKeyboard().text('🔙 Back', 'custom_date_back');
};

/**
 * Creates a confirmation keyboard for key generation
 * @param {string} key - Generated key
 * @returns {InlineKeyboard} Confirmation keyboard
 */
export const createKeyGeneratedKeyboard = (key) => {
  return new InlineKeyboard()
    .text('🔑 Generate Another', 'admin_generate_key')
    .row()
    .text('📋 Copy Key', `copy_key_${key}`)
    .text('🔙 Back', 'admin_back');
};

/**
 * Creates a back button keyboard
 * @param {string} callback - Callback data for back button
 * @returns {InlineKeyboard} Back keyboard
 */
export const createBackKeyboard = (callback = 'menu_back') => {
  return new InlineKeyboard().text('🔙 Back', callback);
};
