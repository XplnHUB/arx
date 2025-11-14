/**
 * Simple logger utility for ARX
 * Supports different log levels and formatted output
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4
};

const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  GRAY: '\x1b[90m'
};

class Logger {
  constructor(options = {}) {
    this.level = LOG_LEVELS[options.level?.toUpperCase()] ?? LOG_LEVELS.INFO;
    this.useColors = options.useColors !== false;
    this.prefix = options.prefix || 'ARX';
  }

  _formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    const levelStr = level.padEnd(5);
    const prefix = `[${timestamp}] [${this.prefix}:${levelStr}]`;

    if (this.useColors) {
      const colorMap = {
        DEBUG: COLORS.GRAY,
        INFO: COLORS.BLUE,
        WARN: COLORS.YELLOW,
        ERROR: COLORS.RED
      };
      return `${colorMap[level]}${prefix}${COLORS.RESET} ${message}`;
    }

    return `${prefix} ${message}`;
  }

  debug(message, data) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      const formatted = this._formatMessage('DEBUG', message, data);
      console.log(formatted, data ? data : '');
    }
  }

  info(message, data) {
    if (this.level <= LOG_LEVELS.INFO) {
      const formatted = this._formatMessage('INFO', message, data);
      console.log(formatted, data ? data : '');
    }
  }

  warn(message, data) {
    if (this.level <= LOG_LEVELS.WARN) {
      const formatted = this._formatMessage('WARN', message, data);
      console.warn(formatted, data ? data : '');
    }
  }

  error(message, data) {
    if (this.level <= LOG_LEVELS.ERROR) {
      const formatted = this._formatMessage('ERROR', message, data);
      console.error(formatted, data ? data : '');
    }
  }

  /**
   * Create a request logger middleware
   */
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      const originalEnd = res.end;

      res.end = function(...args) {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const statusColor = status >= 400 ? COLORS.RED : COLORS.BLUE;

        this.info(
          `${req.method} ${req.url} ${statusColor}${status}${COLORS.RESET} ${duration}ms`
        );

        originalEnd.apply(res, args);
      }.bind(this);

      next();
    };
  }

  /**
   * Create an error logger middleware
   */
  errorLogger() {
    return (err, req, res, next) => {
      this.error(`${req.method} ${req.url}`, {
        statusCode: err.statusCode || 500,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
      next(err);
    };
  }
}

/**
 * Create a new logger instance
 */
function createLogger(options = {}) {
  return new Logger(options);
}

export default createLogger;
export { Logger, LOG_LEVELS };
