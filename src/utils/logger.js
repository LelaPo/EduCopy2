import pino from 'pino';

/**
 * Creates a Pino logger instance with configured transport
 * @param {string} level - Log level (debug, info, warn, error)
 * @returns {import('pino').Logger} Configured logger instance
 */
const createLogger = (level = 'info') => {
  return pino({
    level,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
    },
    base: {
      pid: process.pid,
    },
  });
};

export default createLogger;
