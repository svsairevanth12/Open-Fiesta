/**
 * Production logging utility for AI Fiesta
 * Provides structured logging with different levels and contexts
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogContext {
  feature?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metrics?: {
    duration?: number;
    memoryUsage?: NodeJS.MemoryUsage;
    [key: string]: any;
  };
}

class Logger {
  private logLevel: LogLevel;
  private environment: string;
  private serviceName: string;

  constructor() {
    this.logLevel = this.parseLogLevel(process.env.LOG_LEVEL || 'info');
    this.environment = process.env.NODE_ENV || 'development';
    this.serviceName = process.env.APP_NAME || 'ai-fiesta';
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      case 'critical': return LogLevel.CRITICAL;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error, metrics?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level].toLowerCase(),
      message,
      ...(context && { context: { ...context, service: this.serviceName, environment: this.environment } }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          ...(this.environment === 'development' && { stack: error.stack })
        }
      }),
      ...(metrics && { metrics })
    };

    return entry;
  }

  private output(entry: LogEntry): void {
    if (this.environment === 'production') {
      // In production, output structured JSON logs
      console.log(JSON.stringify(entry));
    } else {
      // In development, output human-readable logs
      const timestamp = entry.timestamp;
      const level = entry.level.toUpperCase().padEnd(8);
      const message = entry.message;
      const context = entry.context ? ` [${JSON.stringify(entry.context)}]` : '';
      const error = entry.error ? ` ERROR: ${entry.error.message}` : '';
      
      console.log(`${timestamp} ${level} ${message}${context}${error}`);
      
      if (entry.error?.stack) {
        console.log(entry.error.stack);
      }
    }
  }

  debug(message: string, context?: LogContext, metrics?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.output(this.formatLog(LogLevel.DEBUG, message, context, undefined, metrics));
    }
  }

  info(message: string, context?: LogContext, metrics?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output(this.formatLog(LogLevel.INFO, message, context, undefined, metrics));
    }
  }

  warn(message: string, context?: LogContext, error?: Error, metrics?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output(this.formatLog(LogLevel.WARN, message, context, error, metrics));
    }
  }

  error(message: string, context?: LogContext, error?: Error, metrics?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(this.formatLog(LogLevel.ERROR, message, context, error, metrics));
    }
  }

  critical(message: string, context?: LogContext, error?: Error, metrics?: any): void {
    if (this.shouldLog(LogLevel.CRITICAL)) {
      this.output(this.formatLog(LogLevel.CRITICAL, message, context, error, metrics));
    }
  }

  // Specialized logging methods for chat sharing feature
  shareCreated(shareId: string, context: LogContext & { messageCount: number; truncated: boolean }): void {
    this.info('Chat share created', {
      ...context,
      feature: 'chat-sharing',
      shareId,
      event: 'share_created'
    });
  }

  shareViewed(shareId: string, context: LogContext): void {
    this.info('Chat share viewed', {
      ...context,
      feature: 'chat-sharing',
      shareId,
      event: 'share_viewed'
    });
  }

  shareError(message: string, context: LogContext, error?: Error): void {
    this.error(`Chat sharing error: ${message}`, {
      ...context,
      feature: 'chat-sharing',
      event: 'share_error'
    }, error);
  }

  // Performance logging
  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${operation}`, context, {
      duration,
      operation
    });
  }

  // Security logging
  securityEvent(event: string, context: LogContext, severity: 'low' | 'medium' | 'high' = 'medium'): void {
    const logMethod = severity === 'high' ? this.critical : severity === 'medium' ? this.warn : this.info;
    
    logMethod.call(this, `Security event: ${event}`, {
      ...context,
      type: 'security',
      event,
      severity
    });
  }

  // CSP violation logging
  cspViolation(violation: any, context: LogContext): void {
    this.warn('CSP violation detected', {
      ...context,
      type: 'security',
      event: 'csp_violation',
      violation
    });
  }
}

// Create singleton instance
export const logger = new Logger();

// Middleware for request logging
export function createRequestLogger() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    // Add request ID to request object
    req.requestId = requestId;
    
    const context: LogContext = {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    logger.info('Request started', context);

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(...args: any[]) {
      const duration = Date.now() - startTime;
      
      logger.info('Request completed', {
        ...context,
        statusCode: res.statusCode,
        duration
      });

      originalEnd.apply(res, args);
    };

    next();
  };
}

// Error handler for logging
export function createErrorLogger() {
  return (error: Error, req: any, res: any, next: any) => {
    const context: LogContext = {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    logger.error('Request error', context, error);
    next(error);
  };
}