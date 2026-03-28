import { v4 as uuidv4 } from 'uuid';

/**
 * AccessKey model operations
 * @param {Database} db - Database instance
 */
const createAccessKeyModel = (db) => {
  // Prepared statements for efficiency
  const findByKey = db.prepare('SELECT * FROM access_keys WHERE key = ?');
  const create = db.prepare(`
    INSERT INTO access_keys (key)
    VALUES (?)
  `);
  const markAsUsed = db.prepare(`
    UPDATE access_keys
    SET is_used = 1, used_by = ?, used_at = CURRENT_TIMESTAMP
    WHERE key = ?
  `);
  const getAll = db.prepare('SELECT * FROM access_keys ORDER BY created_at DESC');
  const getUnusedCount = db.prepare('SELECT COUNT(*) as count FROM access_keys WHERE is_used = 0');
  const getUsedCount = db.prepare('SELECT COUNT(*) as count FROM access_keys WHERE is_used = 1');
  const deleteKey = db.prepare('DELETE FROM access_keys WHERE key = ?');

  return {
    /**
     * Generates a new unique access key
     * @returns {string} Generated key
     */
    async generate() {
      const key = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
      create.run(key);
      return key;
    },

    /**
     * Finds a key by its value
     * @param {string} key - Key value
     * @returns {Object|null} Key object or null
     */
    async findByKey(key) {
      return findByKey.get(key);
    },

    /**
     * Validates and marks a key as used
     * @param {string} key - Key value
     * @param {number} telegramId - Telegram user ID
     * @returns {Object|null} Key object if valid, null if invalid/used
     */
    async validateAndUse(key, telegramId) {
      const existing = await this.findByKey(key);
      if (!existing || existing.is_used) {
        return null;
      }
      markAsUsed.run(telegramId, key);
      return this.findByKey(key);
    },

    /**
     * Gets all access keys
     * @returns {Array} Array of keys
     */
    async getAll() {
      return getAll.all();
    },

    /**
     * Gets count of unused keys
     * @returns {number} Count of unused keys
     */
    async getUnusedCount() {
      return getUnusedCount.get().count;
    },

    /**
     * Gets count of used keys
     * @returns {number} Count of used keys
     */
    async getUsedCount() {
      return getUsedCount.get().count;
    },

    /**
     * Deletes an access key
     * @param {string} key - Key to delete
     * @returns {boolean} Success status
     */
    async delete(key) {
      const result = deleteKey.run(key);
      return result.changes > 0;
    },
  };
};

export default createAccessKeyModel;
