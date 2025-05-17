import winston from 'winston';
import { LogEntry, LogLevel } from '@/types';

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'formflow-automation' },
  transports: [
    // Write to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write to log files
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// In-memory log storage (in a real app, this would be a database)
let logEntries: LogEntry[] = [];

/**
 * Creates a new log entry
 * @param entry - The log entry to create
 * @returns Promise with the created log entry
 */
export async function createLogEntry(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<LogEntry> {
  const logEntry: LogEntry = {
    id: Date.now().toString(),
    timestamp: new Date(),
    ...entry
  };
  
  // Add to in-memory storage
  logEntries.push(logEntry);
  
  // Log to Winston
  const logMethod = logLevelToWinstonMethod(entry.level);
  logger[logMethod]({
    message: entry.message,
    submissionId: entry.submissionId,
    userId: entry.userId,
    metadata: entry.metadata
  });
  
  return logEntry;
}

/**
 * Retrieves log entries with optional filtering
 * @param filters - Optional filters to apply
 * @returns Promise with the filtered log entries
 */
export async function getLogEntries(filters?: {
  submissionId?: string;
  userId?: string;
  level?: LogLevel;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<LogEntry[]> {
  let filteredLogs = [...logEntries];
  
  // Apply filters if provided
  if (filters) {
    if (filters.submissionId) {
      filteredLogs = filteredLogs.filter(log => log.submissionId === filters.submissionId);
    }
    
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }
    
    if (filters.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }
    
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate);
    }
    
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate);
    }
    
    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Apply pagination if provided
    if (filters.offset !== undefined && filters.limit !== undefined) {
      filteredLogs = filteredLogs.slice(filters.offset, filters.offset + filters.limit);
    } else if (filters.limit !== undefined) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }
  }
  
  return filteredLogs;
}

/**
 * Maps LogLevel to Winston log method
 * @param level - The log level to map
 * @returns The corresponding Winston log method
 */
function logLevelToWinstonMethod(level: LogLevel): 'info' | 'warn' | 'error' {
  switch (level) {
    case LogLevel.INFO:
    case LogLevel.SUCCESS:
      return 'info';
    case LogLevel.WARNING:
      return 'warn';
    case LogLevel.ERROR:
      return 'error';
    default:
      return 'info';
  }
}
