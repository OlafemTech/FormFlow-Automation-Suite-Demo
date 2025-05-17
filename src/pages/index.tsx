import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import { FormData, Submission, SubmissionStatus } from '@/types';
import { FiUpload, FiCheckCircle, FiAlertCircle, FiClock, FiFileText } from 'react-icons/fi';

interface DashboardProps {
  recentForms: FormData[];
  recentSubmissions: Submission[];
  stats: {
    totalForms: number;
    totalSubmissions: number;
    pendingSubmissions: number;
    completedSubmissions: number;
    failedSubmissions: number;
  };
}

export default function Dashboard({ recentForms, recentSubmissions, stats }: DashboardProps) {
  // In a real app, this data would come from the server
  // For demo purposes, we'll use static data
  const [formData, setFormData] = useState<FormData[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalForms: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    completedSubmissions: 0,
    failedSubmissions: 0,
  });

  useEffect(() => {
    // Simulate loading data from API
    setFormData(recentForms);
    setSubmissions(recentSubmissions);
    setDashboardStats(stats);
  }, [recentForms, recentSubmissions, stats]);

  return (
    <Layout title="Dashboard | FormFlow Automation Suite">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <a href="/upload" className="btn btn-primary flex items-center">
            <FiUpload className="mr-2" />
            Upload New Form
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiFileText className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Forms</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{dashboardStats.totalForms}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiUpload className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{dashboardStats.totalSubmissions}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiClock className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{dashboardStats.pendingSubmissions}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiCheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{dashboardStats.completedSubmissions}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{dashboardStats.failedSubmissions}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Forms */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Forms</h2>
            <p className="mt-1 text-sm text-gray-500">
              The most recently uploaded PDF forms
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      File Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Uploaded At
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Fields
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.length > 0 ? (
                    formData.map((form) => (
                      <tr key={form.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          <a href={`/forms/${form.id}`} className="text-primary-600 hover:text-primary-900">
                            {form.fileName}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(form.uploadedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            form.status === SubmissionStatus.COMPLETED
                              ? 'bg-green-100 text-green-800'
                              : form.status === SubmissionStatus.FAILED
                              ? 'bg-red-100 text-red-800'
                              : form.status === SubmissionStatus.IN_PROGRESS
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {form.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {Object.keys(form.parsedData).length} fields
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-sm text-center text-gray-500">
                        No forms uploaded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Submissions</h2>
            <p className="mt-1 text-sm text-gray-500">
              The most recent form submissions to government websites
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      ID
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.length > 0 ? (
                    submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          <a href={`/submissions/${submission.id}`} className="text-primary-600 hover:text-primary-900">
                            {submission.id.substring(0, 8)}...
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {submission.targetWebsite}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            submission.status === SubmissionStatus.COMPLETED
                              ? 'bg-green-100 text-green-800'
                              : submission.status === SubmissionStatus.FAILED
                              ? 'bg-red-100 text-red-800'
                              : submission.status === SubmissionStatus.IN_PROGRESS
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {submission.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-sm text-center text-gray-500">
                        No submissions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
  const recentForms: FormData[] = [
    {
      id: 'form1',
      fileName: 'vehicle-registration.pdf',
      fileSize: 245000,
      uploadedBy: session.user?.id || 'unknown',
      uploadedAt: new Date('2025-05-16T10:30:00'),
      parsedData: {
        name: 'John Smith',
        vehicleModel: 'Toyota Camry',
        year: '2023',
        vin: 'JT2BF22K1W0123456',
        address: '123 Main St, Anytown, CA 12345',
      },
      status: SubmissionStatus.COMPLETED,
    },
    {
      id: 'form2',
      fileName: 'license-renewal.pdf',
      fileSize: 180000,
      uploadedBy: session.user?.id || 'unknown',
      uploadedAt: new Date('2025-05-15T14:45:00'),
      parsedData: {
        name: 'Jane Doe',
        licenseNumber: 'D12345678',
        dob: '1985-06-15',
        address: '456 Oak Ave, Somewhere, CA 67890',
      },
      status: SubmissionStatus.PENDING,
    },
    {
      id: 'form3',
      fileName: 'tax-filing.pdf',
      fileSize: 320000,
      uploadedBy: session.user?.id || 'unknown',
      uploadedAt: new Date('2025-05-14T09:15:00'),
      parsedData: {
        name: 'Robert Johnson',
        ssn: '123-45-6789',
        income: '75000',
        filingStatus: 'Single',
      },
      status: SubmissionStatus.FAILED,
    },
  ];

  const recentSubmissions: Submission[] = [
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
  ];

  const stats = {
    totalForms: 3,
    totalSubmissions: 3,
    pendingSubmissions: 1,
    completedSubmissions: 1,
    failedSubmissions: 1,
  };

  return {
    props: {
      recentForms,
      recentSubmissions,
      stats,
    },
  };
};
