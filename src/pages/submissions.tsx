import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import { Submission, SubmissionStatus } from '@/types';
import { FiRefreshCw, FiCheckCircle, FiAlertCircle, FiClock, FiSearch, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface SubmissionsProps {
  initialSubmissions: Submission[];
}

export default function Submissions({ initialSubmissions }: SubmissionsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setSubmissions(initialSubmissions);
    setFilteredSubmissions(initialSubmissions);
  }, [initialSubmissions]);

  useEffect(() => {
    // Apply filters when search term or status filter changes
    let filtered = submissions;

    if (searchTerm) {
      filtered = filtered.filter(
        (submission) =>
          submission.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.targetWebsite.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((submission) => submission.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
  }, [searchTerm, statusFilter, submissions]);

  const refreshSubmissions = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to fetch submissions
      // For demo purposes, we'll simulate the API response
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Simulate updated data
      const updatedSubmissions = [...submissions];
      
      // Update a random submission status
      if (updatedSubmissions.length > 0) {
        const randomIndex = Math.floor(Math.random() * updatedSubmissions.length);
        const submission = updatedSubmissions[randomIndex];
        
        if (submission.status === SubmissionStatus.PENDING) {
          submission.status = SubmissionStatus.IN_PROGRESS;
        } else if (submission.status === SubmissionStatus.IN_PROGRESS) {
          submission.status = SubmissionStatus.COMPLETED;
          submission.completedAt = new Date();
        }
        
        setSubmissions(updatedSubmissions);
        toast.success('Submissions refreshed');
      }
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (submissionId: string) => {
    toast.loading('Retrying submission...', { duration: 2000 });
    
    try {
      // In a real app, this would be an API call to retry the submission
      // For demo purposes, we'll simulate the API response
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Update the submission status
      const updatedSubmissions = submissions.map((submission) => {
        if (submission.id === submissionId) {
          return {
            ...submission,
            status: SubmissionStatus.IN_PROGRESS,
          };
        }
        return submission;
      });
      
      setSubmissions(updatedSubmissions);
      toast.success('Submission retry initiated');
    } catch (error) {
      console.error('Retry error:', error);
      toast.error('Failed to retry submission');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case SubmissionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case SubmissionStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case SubmissionStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Layout title="Submissions | FormFlow Automation Suite">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Form Submissions</h1>
          <button
            onClick={refreshSubmissions}
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
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiFilter className="w-5 h-5 text-gray-400" />
            </div>
            <select
              className="input pl-10 pr-10 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value={SubmissionStatus.PENDING}>Pending</option>
              <option value={SubmissionStatus.IN_PROGRESS}>In Progress</option>
              <option value={SubmissionStatus.COMPLETED}>Completed</option>
              <option value={SubmissionStatus.FAILED}>Failed</option>
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

        {/* Submissions Table */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Form ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Submitted At
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Target Website
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        <a href={`/submissions/${submission.id}`} className="text-primary-600 hover:text-primary-900">
                          {submission.id.substring(0, 8)}...
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        <a href={`/forms/${submission.formDataId}`} className="text-primary-600 hover:text-primary-900">
                          {submission.formDataId.substring(0, 8)}...
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {submission.targetWebsite}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(submission.status)}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex space-x-2">
                          <a
                            href={`/submissions/${submission.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View
                          </a>
                          {submission.status === SubmissionStatus.FAILED && (
                            <button
                              onClick={() => handleRetry(submission.id)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-sm text-center text-gray-500">
                      No submissions found
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
  const submissions: Submission[] = [
    {
      id: 'sub1',
      formDataId: 'form1',
      submittedBy: session.user?.id || 'unknown',
      submittedAt: new Date('2025-05-16T11:00:00'),
      status: SubmissionStatus.COMPLETED,
      targetWebsite: 'https://dmv.ca.gov/vehicle-registration',
      completedAt: new Date('2025-05-16T11:05:00'),
    },
    {
      id: 'sub2',
      formDataId: 'form3',
      submittedBy: session.user?.id || 'unknown',
      submittedAt: new Date('2025-05-14T10:00:00'),
      status: SubmissionStatus.FAILED,
      targetWebsite: 'https://irs.gov/tax-filing',
      errorMessage: 'Form validation failed: Missing required field "dependents"',
    },
    {
      id: 'sub3',
      formDataId: 'form2',
      submittedBy: session.user?.id || 'unknown',
      submittedAt: new Date('2025-05-15T15:00:00'),
      status: SubmissionStatus.PENDING,
      targetWebsite: 'https://dmv.ca.gov/license-renewal',
    },
    {
      id: 'sub4',
      formDataId: 'form4',
      submittedBy: session.user?.id || 'unknown',
      submittedAt: new Date('2025-05-13T09:30:00'),
      status: SubmissionStatus.IN_PROGRESS,
      targetWebsite: 'https://ssa.gov/benefits-application',
    },
    {
      id: 'sub5',
      formDataId: 'form5',
      submittedBy: session.user?.id || 'unknown',
      submittedAt: new Date('2025-05-12T14:15:00'),
      status: SubmissionStatus.COMPLETED,
      targetWebsite: 'https://travel.state.gov/passport-renewal',
      completedAt: new Date('2025-05-12T14:20:00'),
    },
  ];

  return {
    props: {
      initialSubmissions: submissions,
    },
  };
};
