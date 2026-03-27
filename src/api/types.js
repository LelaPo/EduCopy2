/**
 * Type helpers and response transformers for API data
 */

/**
 * Transforms API homework response to a normalized format
 * @param {Object} apiResponse - Raw API response
 * @returns {Array} Normalized homework array
 */
export const transformHomeworkResponse = (apiResponse) => {
  if (!apiResponse) return [];

  // Handle different response structures
  if (Array.isArray(apiResponse)) {
    return apiResponse.map(normalizeHomeworkItem);
  }

  if (apiResponse.homeworks && Array.isArray(apiResponse.homeworks)) {
    return apiResponse.homeworks.map(normalizeHomeworkItem);
  }

  if (apiResponse.data && Array.isArray(apiResponse.data)) {
    return apiResponse.data.map(normalizeHomeworkItem);
  }

  return [];
};

/**
 * Normalizes a single homework item
 * @param {Object} item - Raw homework item
 * @returns {Object} Normalized homework item
 */
const normalizeHomeworkItem = (item) => {
  return {
    id: item.id || item.homework_id,
    subject_name: item.subject_name || item.subject || 'Unknown Subject',
    subject_id: item.subject_id,
    task_text: item.task_text || item.description || item.task || 'No description',
    due_date: item.due_date || item.deadline || item.due,
    status: normalizeStatus(item.status),
    created_at: item.created_at,
    updated_at: item.updated_at,
    attachments: item.attachments || [],
    comments: item.comments || [],
    student_id: item.student_id,
    _raw: item, // Keep raw data for debugging
  };
};

/**
 * Transforms API schedule response to a normalized format
 * @param {Object} apiResponse - Raw API response
 * @returns {Array} Normalized schedule array
 */
export const transformScheduleResponse = (apiResponse) => {
  if (!apiResponse) return [];

  // Handle different response structures
  if (Array.isArray(apiResponse)) {
    return apiResponse.map(normalizeScheduleItem);
  }

  if (apiResponse.schedule && Array.isArray(apiResponse.schedule)) {
    return apiResponse.schedule.map(normalizeScheduleItem);
  }

  if (apiResponse.data && Array.isArray(apiResponse.data)) {
    return apiResponse.data.map(normalizeScheduleItem);
  }

  if (apiResponse.lessons && Array.isArray(apiResponse.lessons)) {
    return apiResponse.lessons.map(normalizeScheduleItem);
  }

  return [];
};

/**
 * Normalizes a single schedule item
 * @param {Object} item - Raw schedule item
 * @returns {Object} Normalized schedule item
 */
const normalizeScheduleItem = (item) => {
  return {
    id: item.id || item.lesson_id,
    date: item.date,
    subject_name: item.subject_name || item.subject || 'Unknown Subject',
    subject_id: item.subject_id,
    room: item.room || item.classroom,
    start_time: item.start_time || item.time_start,
    end_time: item.end_time || item.time_end,
    teacher_name: item.teacher_name || item.teacher,
    lesson_number: item.lesson_number || item.order,
    _raw: item, // Keep raw data for debugging
  };
};

/**
 * Normalizes homework status values
 * @param {string} status - Raw status value
 * @returns {string} Normalized status
 */
const normalizeStatus = (status) => {
  if (!status) return 'unknown';

  const normalized = status.toLowerCase();

  if (['assigned', 'new', 'open'].includes(normalized)) {
    return 'assigned';
  }
  if (['completed', 'done', 'finished'].includes(normalized)) {
    return 'completed';
  }
  if (['overdue', 'late', 'expired'].includes(normalized)) {
    return 'overdue';
  }

  return 'unknown';
};

/**
 * Extracts unique student IDs from a response
 * @param {Object} apiResponse - Raw API response
 * @returns {Array} Array of student IDs
 */
export const extractStudentIds = (apiResponse) => {
  if (!apiResponse) return [];

  let students = [];

  if (Array.isArray(apiResponse)) {
    students = apiResponse;
  } else if (apiResponse.students && Array.isArray(apiResponse.students)) {
    students = apiResponse.students;
  } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
    students = apiResponse.data;
  }

  return students
    .map((s) => s.id || s.student_id)
    .filter(Boolean);
};

/**
 * Gets the first student ID from response
 * @param {Object} apiResponse - Raw API response
 * @returns {string|null} First student ID or null
 */
export const getFirstStudentId = (apiResponse) => {
  const ids = extractStudentIds(apiResponse);
  return ids[0] || null;
};
