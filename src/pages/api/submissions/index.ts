import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/utils/auth';
import { getFormDataById } from '@/utils/database';
import { saveSubmission, updateFormData } from '@/utils/database';
import { submitFormToWebsite } from '@/lib/automation/formSubmitter';
import { createLogEntry } from '@/utils/logger';
import { LogLevel, SubmissionStatus } from '@/types';
import { sendSubmissionStatusEmail } from '@/utils/email';

/**
 * API handler for creating and managing form submissions
 */
export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user
) {
  if (req.method === 'POST') {
    // Create a new submission
    try {
      const { formDataId, targetWebsite, config } = req.body;
      
      if (!formDataId || !targetWebsite) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Get the form data
      const formData = await getFormDataById(formDataId);
      
      if (!formData) {
        return res.status(404).json({ error: 'Form data not found' });
      }
      
      // Create a submission ID
      const submissionId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Update form status to in progress
      formData.status = SubmissionStatus.IN_PROGRESS;
      await updateFormData(formData);
      
      // Log the submission start
      await createLogEntry({
        level: LogLevel.INFO,
        message: `Starting form submission for ${formData.fileName} to ${targetWebsite}`,
        submissionId,
        userId: user.id,
      });
      
      // Create a submission configuration
      const submissionConfig = {
        url: targetWebsite,
        fieldMappings: config?.fieldMappings || [],
        submitButtonSelector: config?.submitButtonSelector || 'button[type="submit"]',
        successIndicator: config?.successIndicator || 'success',
        errorIndicator: config?.errorIndicator,
        preSubmitSteps: config?.preSubmitSteps,
        postSubmitSteps: config?.postSubmitSteps,
      };
      
      // Submit the form data to the target website (non-blocking)
      submitFormToWebsite(formData, submissionId, user.id, submissionConfig)
        .then(async (submission) => {
          // Save the submission result
          await saveSubmission(submission);
          
          // Update form status based on submission status
          formData.status = submission.status;
          await updateFormData(formData);
          
          // Send email notification
          await sendSubmissionStatusEmail(submission, formData, user);
          
          // Log the submission completion
          await createLogEntry({
            level: submission.status === SubmissionStatus.COMPLETED ? LogLevel.SUCCESS : LogLevel.ERROR,
            message: `Form submission ${submission.status}: ${formData.fileName} to ${targetWebsite}`,
            submissionId,
            userId: user.id,
            metadata: {
              status: submission.status,
              completedAt: submission.completedAt,
              errorMessage: submission.errorMessage,
            },
          });
        })
        .catch(async (error) => {
          // Log the submission error
          await createLogEntry({
            level: LogLevel.ERROR,
            message: `Form submission error: ${(error as Error).message}`,
            submissionId,
            userId: user.id,
            metadata: {
              stack: (error as Error).stack,
            },
          });
        });
      
      // Return the submission ID immediately
      return res.status(200).json({
        success: true,
        submissionId,
        message: 'Submission started',
      });
    } catch (error) {
      console.error('Submission error:', error);
      
      // Log the error
      await createLogEntry({
        level: LogLevel.ERROR,
        message: `Form submission failed: ${(error as Error).message}`,
        userId: user.id,
        metadata: {
          stack: (error as Error).stack,
        },
      });
      
      return res.status(500).json({ error: 'Failed to submit the form' });
    }
  } else if (req.method === 'GET') {
    // Get all submissions or a specific submission
    try {
      const { id } = req.query;
      
      if (id) {
        // Get a specific submission
        const submission = await getSubmissionById(id as string);
        
        if (!submission) {
          return res.status(404).json({ error: 'Submission not found' });
        }
        
        return res.status(200).json({ submission });
      } else {
        // Get all submissions with pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        const submissions = await getAllSubmissions({ page, limit });
        
        return res.status(200).json(submissions);
      }
    } catch (error) {
      console.error('Get submissions error:', error);
      return res.status(500).json({ error: 'Failed to get submissions' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
});

// Import these functions from the database utility
async function getSubmissionById(id: string) {
  // This would be implemented in the database utility
  // For now, return a mock submission
  return {
    id,
    formDataId: 'form1',
    submittedBy: 'user1',
    submittedAt: new Date(),
    status: SubmissionStatus.COMPLETED,
    targetWebsite: 'https://example.com',
    completedAt: new Date(),
  };
}

async function getAllSubmissions({ page, limit }: { page: number; limit: number }) {
  // This would be implemented in the database utility
  // For now, return mock submissions
  return {
    data: [
      {
        id: 'sub1',
        formDataId: 'form1',
        submittedBy: 'user1',
        submittedAt: new Date(),
        status: SubmissionStatus.COMPLETED,
        targetWebsite: 'https://example.com',
        completedAt: new Date(),
      },
    ],
    total: 1,
    page,
    limit,
    totalPages: 1,
  };
}
