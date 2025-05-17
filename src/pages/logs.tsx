import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import { LogEntry, LogLevel } from '@/types';
import { FiRefreshCw, FiSearch, FiFilter, FiInfo, FiAlertCircle, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface LogsProps {
  initialLogs: LogEntry[];
}

export default function Logs({ initialLogs }: LogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    setLogs(initialLogs);
    setFilteredLogs(initialLogs);
  }, [initialLogs]);

  useEffect(() => {
    // Apply filters when search term, level filter, or date filter changes
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.submissionId && log.submissionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter((log) => log.level === levelFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'yesterday':
          startDate = new Date(now.setDate(now.getDate() - 1));
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }

      filtered = filtered.filter((log) => new Date(log.timestamp) >= startDate);
    }

    setFilteredLogs(filtered);
  }, [searchTerm, levelFilter, dateFilter, logs]);

  const refreshLogs = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to fetch logs
      // For demo purposes, we'll simulate the API response
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Simulate new log entries
      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: `System refreshed at ${new Date().toLocaleTimeString()}`,
        userId: 'system',
      };
      
      setLogs([newLog, ...logs]);
      toast.success('Logs refreshed');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh logs');
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case LogLevel.INFO:
        return <FiInfo className="w-5 h-5 text-blue-500" />;
      case LogLevel.WARNING:
        return <FiAlertTriangle className="w-5 h-5 text-yellow-500" />;
      case LogLevel.ERROR:
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      case LogLevel.SUCCESS:
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <FiInfo className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLevelBadgeClass = (level: LogLevel) => {
    switch (level) {
      case LogLevel.INFO:
        return 'bg-blue-100 text-blue-800';
      case LogLevel.WARNING:
        return 'bg-yellow-100 text-yellow-800';
      case LogLevel.ERROR:
        return 'bg-red-100 text-red-800';
      case LogLevel.SUCCESS:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title="Logs | FormFlow Automation Suite">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <button
            onClick={refreshLogs}
            disabled={isLoading}
            className="btn btn-primary flex items-center"
          >
            <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative w-full md:w-48">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiFilter className="w-5 h-5 text-gray-400" />
            </div>
            <select
              className="input pl-10 pr-10 appearance-none"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              aria-label="Filter logs by level"
            >
              <option value="all">All Levels</option>
              <option value={LogLevel.INFO}>Info</option>
              <option value={LogLevel.WARNING}>Warning</option>
              <option value={LogLevel.ERROR}>Error</option>
              <option value={LogLevel.SUCCESS}>Success</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          
          <div className="relative w-full md:w-48">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <select
              className="input pl-10 pr-10 appearance-none"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filter logs by date range"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Message
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Submission ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    User ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <div className="flex items-center">
                          {getLevelIcon(log.level)}
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeClass(log.level)}`}>
                            {log.level}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {log.submissionId ? (
                          <a href={`/submissions/${log.submissionId}`} className="text-primary-600 hover:text-primary-900">
                            {log.submissionId.substring(0, 8)}...
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {log.userId || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-sm text-center text-gray-500">
                      No logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  // In a real app, this data would come from the database
  // For demo purposes, we'll use static data
  const logs: LogEntry[] = [
    {
      id: 'log1',
      timestamp: new Date('2025-05-17T14:30:00'),
      level: LogLevel.INFO,
      message: 'System started',
      userId: 'system',
    },
    {
      id: 'log2',
      timestamp: new Date('2025-05-17T14:35:00'),
      level: LogLevel.INFO,
      message: 'User logged in',
      userId: session.user?.id || 'unknown',
    },
    {
      id: 'log3',
      timestamp: new Date('2025-05-17T14:40:00'),
      level: LogLevel.INFO,
      message: 'Form uploaded: vehicle-registration.pdf',
      userId: session.user?.id || 'unknown',
    },
    {
      id: 'log4',
      timestamp: new Date('2025-05-17T14:45:00'),
      level: LogLevel.SUCCESS,
      message: 'Form parsed successfully: 9 fields extracted',
      submissionId: 'sub1',
      userId: session.user?.id || 'unknown',
    },
    {
      id: 'log5',
      timestamp: new Date('2025-05-17T14:50:00'),
      level: LogLevel.INFO,
      message: 'Starting form submission to DMV website',
      submissionId: 'sub1',
      userId: session.user?.id || 'unknown',
    },
    {
      id: 'log6',
      timestamp: new Date('2025-05-17T14:55:00'),
      level: LogLevel.SUCCESS,
      message: 'Form submitted successfully to DMV website',
      submissionId: 'sub1',
      userId: session.user?.id || 'unknown',
    },
    {
      id: 'log7',
      timestamp: new Date('2025-05-16T10:15:00'),
      level: LogLevel.WARNING,
      message: 'Form submission taking longer than expected',
      submissionId: 'sub2',
      userId: session.user?.id || 'unknown',
    },
    {
      id: 'log8',
      timestamp: new Date('2025-05-16T10:20:00'),
      level: LogLevel.ERROR,
      message: 'Form submission failed: Missing required field "dependents"',
      submissionId: 'sub2',
      userId: session.user?.id || 'unknown',
      metadata: {
        errorCode: 'FIELD_VALIDATION_ERROR',
        fieldName: 'dependents',
      },
    },
    {
      id: 'log9',
      timestamp: new Date('2025-05-16T11:30:00'),
      level: LogLevel.INFO,
      message: 'Email notification sent to user',
      submissionId: 'sub2',
      userId: session.user?.id || 'unknown',
    },
    {
      id: 'log10',
      timestamp: new Date('2025-05-15T09:00:00'),
      level: LogLevel.INFO,
      message: 'System maintenance started',
      userId: 'system',
    },
  ];

  return {
    props: {
      initialLogs: logs,
    },
  };
};
