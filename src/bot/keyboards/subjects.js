import Telegraf from 'telegraf';
const { InlineKeyboard } = Telegraf;

/**
 * Creates a keyboard with subject quick filters
 * @param {Array} homeworks - Array of homework items
 * @returns {InlineKeyboard} Subject quick filter keyboard
 */
export const createQuickSubjectFilter = (homeworks) => {
  const subjects = [...new Set(homeworks.map((h) => h.subject_name).filter(Boolean))];

  if (subjects.length === 0) {
    return new InlineKeyboard().text('🔙 Back', 'subject_back');
  }

  const keyboard = new InlineKeyboard();

  // Show up to 6 subjects in a grid
  const maxSubjects = 6;
  const displaySubjects = subjects.slice(0, maxSubjects);

  for (let i = 0; i < displaySubjects.length; i += 2) {
    keyboard.text(`📖 ${displaySubjects[i]}`, `quick_subject_${displaySubjects[i]}`);
    if (displaySubjects[i + 1]) {
      keyboard.text(`📖 ${displaySubjects[i + 1]}`, `quick_subject_${displaySubjects[i + 1]}`);
    }
    keyboard.row();
  }

  if (subjects.length > maxSubjects) {
    keyboard.text(`📋 All ${subjects.length} subjects`, 'subject_all');
    keyboard.row();
  }

  keyboard.text('🔙 Back', 'subject_back');

  return keyboard;
};

/**
 * Creates a subject selection keyboard for homework view
 * @param {Array<string>} subjects - List of all subjects
 * @param {string|null} selected - Currently selected subject
 * @returns {InlineKeyboard} Subject selection keyboard
 */
export const createSubjectSelectionKeyboard = (subjects, selected = null) => {
  const keyboard = new InlineKeyboard();

  // Group subjects by first letter for better organization
  const grouped = subjects.reduce((acc, subject) => {
    const firstLetter = subject.charAt(0).toUpperCase();
    acc[firstLetter] = acc[firstLetter] || [];
    acc[firstLetter].push(subject);
    return acc;
  }, {});

  // Display subjects with selection indicator
  for (const subject of subjects) {
    const prefix = selected === subject ? '✅ ' : '▫️ ';
    keyboard.text(`${prefix}${subject}`, `select_subject_${subject}`);
  }

  keyboard.row();
  keyboard.text('🗑️ Clear', 'clear_subject');
  keyboard.text('🔙 Back', 'back_to_homework');

  return keyboard;
};
