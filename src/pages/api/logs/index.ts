import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/utils/auth';
import { createLogEntry, getLogEntries } from '@/utils/logger';
import { LogLevel } from '@/types';

/**
 * API handler for retrieving and creating log entries
 */
export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user
) {
  if (req.method === 'GET') {
    // Get logs with optional filtering
    try {
      const {
        submissionId,
        userId,
        level,
        startDate,
        endDate,
        page = '1',
        limit = '20',
      } = req.query;
      
      const filters: any = {};
      
      if (submissionId) {
        filters.submissionId = submissionId as string;
      }
      
      if (userId) {
        filters.userId = userId as string;
      }
      
      if (level) {
        filters.level = level as LogLevel;
      }
      
      if (startDate) {
        filters.startDate = new Date(startDate as string);
      }
      
      if (endDate) {
        filters.endDate = new Date(endDate as string);
      }
      
      const logs = await getLogEntries(filters, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
      
      return res.status(200).json(logs);
    } catch (error) {
      console.error('Get logs error:', error);
      return res.status(500).json({ error: 'Failed to get logs' });
    }
  } else if (req.method === 'POST') {
    // Create a new log entry (admin only)
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    try {
      const { level, message, submissionId, metadata } = req.body;
      
      if (!level || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const logEntry = await createLogEntry({
        level: level as LogLevel,
        message,
        submissionId,
        userId: user.id,
        metadata,
      });
      
      return res.status(201).json({ success: true, logEntry });
    } catch (error) {
      console.error('Create log error:', error);
      return res.status(500).json({ error: 'Failed to create log entry' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
});
