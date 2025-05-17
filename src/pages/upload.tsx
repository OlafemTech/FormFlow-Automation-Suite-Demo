import React, { useState, useRef } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import { FormData, SubmissionStatus } from '@/types';
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedForm, setUploadedForm] = useState<FormData | null>(null);
  const [parsedFields, setParsedFields] = useState<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setUploadedForm(null);
      setParsedFields({});
    } else if (selectedFile) {
      toast.error('Please select a PDF file');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setUploadedForm(null);
      setParsedFields({});
    } else if (droppedFile) {
      toast.error('Please drop a PDF file');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, 300);

    try {
      // In a real app, this would be an API call to upload and parse the PDF
      // For demo purposes, we'll simulate the API response
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Simulate parsed data from the PDF
      const mockParsedData = {
        name: 'John Smith',
        dob: '1980-05-15',
        address: '123 Main St, Anytown, CA 12345',
        phone: '555-123-4567',
        email: 'john.smith@example.com',
        licenseNumber: 'DL12345678',
        vehicleModel: 'Toyota Camry',
        vehicleYear: '2023',
        vin: 'JT2BF22K1W0123456',
      };

      // Create a form data object
      const formData: FormData = {
        id: `form-${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        uploadedBy: 'current-user-id', // In a real app, this would be the current user's ID
        uploadedAt: new Date(),
        parsedData: mockParsedData,
        status: SubmissionStatus.PENDING,
      };

      setUploadedForm(formData);
      setParsedFields(mockParsedData);
      toast.success('Form uploaded and parsed successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload and parse the form');
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedForm) {
      toast.error('Please upload a form first');
      return;
    }

    toast.loading('Submitting form to government website...', { duration: 3000 });

    try {
      // In a real app, this would be an API call to submit the form data
      // For demo purposes, we'll simulate the API response
      await new Promise((resolve) => setTimeout(resolve, 3000));

      toast.success('Form submitted successfully to government website');

      // Reset the form
      setFile(null);
      setUploadedForm(null);
      setParsedFields({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit the form');
    }
  };

  return (
    <Layout title="Upload Form | FormFlow Automation Suite">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload PDF Form</h1>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <div
              className={`border-2 border-dashed rounded-lg ${
                file ? 'border-primary-500' : 'border-gray-300'
              } transition-colors duration-200 ease-in-out`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="px-4 py-8 text-center sm:px-6">
                <FiUpload className="w-12 h-12 mx-auto text-gray-400" />
                <div className="flex mt-4 text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative font-medium text-primary-600 bg-white rounded-md cursor-pointer hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a PDF file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="mt-2 text-xs text-gray-500">PDF up to 10MB</p>

                {file && (
                  <div className="flex items-center justify-center mt-4 space-x-2">
                    <FiFile className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                    <span className="text-sm text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}

                {isUploading && (
                  <div className="w-full mt-4">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-2 bg-primary-600 rounded-full w-[${uploadProgress}%]`}
                      ></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Uploading and parsing... {uploadProgress}%</p>
                  </div>
                )}

                {!isUploading && file && !uploadedForm && (
                  <button
                    type="button"
                    onClick={handleUpload}
                    className="btn btn-primary mt-4"
                  >
                    Upload and Parse
                  </button>
                )}
              </div>
            </div>

            {uploadedForm && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Parsed Form Data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Review the extracted data before submitting to the government website
                </p>

                <div className="mt-4 overflow-hidden border border-gray-200 rounded-lg">
                  <div className="px-4 py-5 bg-gray-50 sm:px-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {uploadedForm.fileName}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Uploaded at {uploadedForm.uploadedAt.toLocaleString()}
                    </p>
                  </div>

                  <div className="px-4 py-5 border-t border-gray-200 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      {Object.entries(parsedFields).map(([key, value]) => (
                        <div key={key} className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn btn-primary"
                  >
                    Submit to Government Website
                  </button>
                </div>
              </div>
            )}
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

  return {
    props: {},
  };
};
