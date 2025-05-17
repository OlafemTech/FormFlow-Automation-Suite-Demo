export enum SubmissionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  createdAt: Date;
}

export interface FormData {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  parsedData: Record<string, any>;
  status: SubmissionStatus;
}

export interface Submission {
  id: string;
  formDataId: string;
  submittedBy: string;
  submittedAt: Date;
  status: SubmissionStatus;
  targetWebsite: string;
  completedAt?: Date;
  errorMessage?: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  submissionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
