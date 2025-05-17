// In-memory implementation instead of SQLite3
import { FormData, Submission, LogEntry, PaginationParams, PaginatedResponse } from '@/types';

// In-memory storage for development
const inMemoryStorage = {
  formData: new Map<string, FormData>(),
  submissions: new Map<string, Submission>(),
  logs: new Map<string, LogEntry>()
};

console.log('Using in-memory storage for development');

// No need to create tables for in-memory implementation

/**
 * Saves form data to the in-memory storage
 * @param formData - The form data to save
 * @returns Promise with the saved form data
 */
export function saveFormData(formData: FormData): Promise<FormData> {
  inMemoryStorage.formData.set(formData.id, formData);
  return Promise.resolve(formData);
}

/**
 * Updates form data in the in-memory storage
 * @param formData - The form data to update
 * @returns Promise with the updated form data
 */
export function updateFormData(formData: FormData): Promise<FormData> {
  if (inMemoryStorage.formData.has(formData.id)) {
    inMemoryStorage.formData.set(formData.id, formData);
  }
  return Promise.resolve(formData);
}

/**
 * Gets form data from the in-memory storage by ID
 * @param id - The ID of the form data to get
 * @returns Promise with the form data
 */
export function getFormDataById(id: string): Promise<FormData | null> {
  const formData = inMemoryStorage.formData.get(id) || null;
  return Promise.resolve(formData);
}

/**
 * Gets all form data from the in-memory storage with pagination
 * @param params - Pagination parameters
 * @returns Promise with paginated form data
 */
export function getAllFormData(params: PaginationParams): Promise<PaginatedResponse<FormData>> {
  const { page, limit } = params;
  const offset = (page - 1) * limit;
  
  const allFormData = Array.from(inMemoryStorage.formData.values());
  // Sort by uploadedAt (newest first)
  allFormData.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  
  const paginatedData = allFormData.slice(offset, offset + limit);
  const total = allFormData.length;
  
  return Promise.resolve({
    data: paginatedData,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}

/**
 * Saves a submission to the in-memory storage
 * @param submission - The submission to save
 * @returns Promise with the saved submission
 */
export function saveSubmission(submission: Submission): Promise<Submission> {
  inMemoryStorage.submissions.set(submission.id, submission);
  return Promise.resolve(submission);
}

/**
 * Updates a submission in the in-memory storage
 * @param submission - The submission to update
 * @returns Promise with the updated submission
 */
export function updateSubmission(submission: Submission): Promise<Submission> {
  if (inMemoryStorage.submissions.has(submission.id)) {
    inMemoryStorage.submissions.set(submission.id, submission);
  }
  return Promise.resolve(submission);
}

/**
 * Gets a submission from the in-memory storage by ID
 * @param id - The ID of the submission to get
 * @returns Promise with the submission
 */
export function getSubmissionById(id: string): Promise<Submission | null> {
  const submission = inMemoryStorage.submissions.get(id) || null;
  return Promise.resolve(submission);
}

/**
 * Gets all submissions from the in-memory storage with pagination
 * @param params - Pagination parameters
 * @returns Promise with paginated submissions
 */
export function getAllSubmissions(params: PaginationParams): Promise<PaginatedResponse<Submission>> {
  const { page, limit } = params;
  const offset = (page - 1) * limit;
  
  const allSubmissions = Array.from(inMemoryStorage.submissions.values());
  // Sort by submittedAt (newest first)
  allSubmissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  
  const paginatedData = allSubmissions.slice(offset, offset + limit);
  const total = allSubmissions.length;
  
  return Promise.resolve({
    data: paginatedData,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}

/**
 * Saves a log entry to the in-memory storage
 * @param logEntry - The log entry to save
 * @returns Promise with the saved log entry
 */
export function saveLogEntry(logEntry: LogEntry): Promise<LogEntry> {
  inMemoryStorage.logs.set(logEntry.id, logEntry);
  return Promise.resolve(logEntry);
}

/**
 * Gets log entries from the in-memory storage with pagination and filters
 * @param params - Pagination parameters
 * @param filters - Optional filters
 * @returns Promise with paginated log entries
 */
export function getLogEntries(
  params: PaginationParams,
  filters?: {
    submissionId?: string;
    userId?: string;
    level?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<PaginatedResponse<LogEntry>> {
  const { page, limit } = params;
  const offset = (page - 1) * limit;
  
  let allLogs = Array.from(inMemoryStorage.logs.values());
  
  // Apply filters if provided
  if (filters) {
    if (filters.submissionId) {
      allLogs = allLogs.filter(log => log.submissionId === filters.submissionId);
    }
    
    if (filters.userId) {
      allLogs = allLogs.filter(log => log.userId === filters.userId);
    }
    
    if (filters.level) {
      allLogs = allLogs.filter(log => log.level === filters.level);
    }
    
    if (filters.startDate) {
      allLogs = allLogs.filter(log => log.timestamp >= filters.startDate!);
    }
    
    if (filters.endDate) {
      allLogs = allLogs.filter(log => log.timestamp <= filters.endDate!);
    }
  }
  
  // Sort by timestamp (newest first)
  allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  const paginatedData = allLogs.slice(offset, offset + limit);
  const total = allLogs.length;
  
  return Promise.resolve({
    data: paginatedData,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}

/**
 * Closes the database connection (no-op for in-memory implementation)
 */
export function closeDatabase(): Promise<void> {
  return Promise.resolve();
}
