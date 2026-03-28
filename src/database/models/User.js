/**
 * User model operations
 * @param {Database} db - Database instance
 */
const createUserModel = (db) => {
  // Prepared statements for efficiency
  const findById = db.prepare('SELECT * FROM users WHERE telegram_id = ?');
  const create = db.prepare(`
    INSERT INTO users (telegram_id, username, first_name, last_name, has_access)
    VALUES (?, ?, ?, ?, 0)
    ON CONFLICT(telegram_id) DO UPDATE SET
      username = excluded.username,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      updated_at = CURRENT_TIMESTAMP
  `);
  const grantAccess = db.prepare(`
    UPDATE users SET has_access = 1, updated_at = CURRENT_TIMESTAMP
    WHERE telegram_id = ?
  `);
  const getAll = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
  const getCount = db.prepare('SELECT COUNT(*) as count FROM users');
  const getAccessedCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE has_access = 1');

  return {
    /**
     * Finds a user by Telegram ID
     * @param {number} telegramId - Telegram user ID
     * @returns {Object|null} User object or null
     */
    async findById(telegramId) {
      return findById.get(telegramId);
    },

    /**
     * Creates or updates a user
     * @param {number} telegramId - Telegram user ID
     * @param {Object} info - User info (username, first_name, last_name)
     * @returns {Object} Created/updated user
     */
    async createOrUpdate(telegramId, info = {}) {
      create.run(
        telegramId,
        info.username || null,
        info.first_name || null,
        info.last_name || null
      );
      return await this.findById(telegramId);
    },

    /**
     * Grants access to a user
     * @param {number} telegramId - Telegram user ID
     * @returns {boolean} Success status
     */
    async grantAccess(telegramId) {
      const result = grantAccess.run(telegramId);
      return result.changes > 0;
    },

    /**
     * Gets all users
     * @returns {Array} Array of users
     */
    async getAll() {
      return getAll.all();
    },

    /**
     * Gets total user count
     * @returns {number} Total count
     */
    async getCount() {
      return getCount.get().count;
    },

    /**
     * Gets count of users with access
     * @returns {number} Count of users with access
     */
    async getAccessedCount() {
      return getAccessedCount.get().count;
    },
  };
};

export default createUserModel;
