import { Submission, SubmissionStatus, FormData, User } from '@/types';

/**
 * Interface for email service configuration
 */
interface EmailConfig {
  from: string;
  replyTo?: string;
  adminEmails: string[];
}

/**
 * Email service configuration (in a real app, this would be in environment variables)
 */
const emailConfig: EmailConfig = {
  from: 'formflow@example.com',
  replyTo: 'no-reply@example.com',
  adminEmails: ['admin@example.com']
};

/**
 * In a real application, this would use a proper email service like SendGrid, Mailgun, etc.
 * This is a mock implementation for demonstration purposes
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
): Promise<boolean> {
  // Mock implementation - in a real app, this would send an actual email
  console.log('Sending email:');
  console.log('To:', Array.isArray(to) ? to.join(', ') : to);
  console.log('Subject:', subject);
  console.log('Body:', html);
  
  // Simulate successful email sending
  return true;
}

/**
 * Sends a notification email when a form submission status changes
 * @param submission - The submission that changed status
 * @param formData - The associated form data
 * @param user - The user who initiated the submission
 * @returns Promise indicating if the email was sent successfully
 */
export async function sendSubmissionStatusEmail(
  submission: Submission,
  formData: FormData,
  user: User
): Promise<boolean> {
  // Determine recipients
  const recipients = [user.email, ...emailConfig.adminEmails];
  
  // Create email subject based on submission status
  let subject = '';
  let statusText = '';
  
  switch (submission.status) {
    case SubmissionStatus.COMPLETED:
      subject = `✅ Form Submission Completed: ${formData.fileName}`;
      statusText = 'successfully completed';
      break;
    case SubmissionStatus.FAILED:
      subject = `❌ Form Submission Failed: ${formData.fileName}`;
      statusText = 'failed';
      break;
    case SubmissionStatus.IN_PROGRESS:
      subject = `⏳ Form Submission In Progress: ${formData.fileName}`;
      statusText = 'in progress';
      break;
    default:
      subject = `Form Submission Update: ${formData.fileName}`;
      statusText = submission.status;
  }
  
  // Create email body
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0284c7;">Form Submission Update</h2>
      <p>The submission for form <strong>${formData.fileName}</strong> is now <strong>${statusText}</strong>.</p>
      
      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #334155;">Submission Details</h3>
        <p><strong>Submission ID:</strong> ${submission.id}</p>
        <p><strong>Submitted By:</strong> ${user.name} (${user.email})</p>
        <p><strong>Submitted At:</strong> ${submission.submittedAt.toLocaleString()}</p>
        <p><strong>Target Website:</strong> ${submission.targetWebsite}</p>
        ${submission.completedAt ? `<p><strong>Completed At:</strong> ${submission.completedAt.toLocaleString()}</p>` : ''}
        ${submission.errorMessage ? `<p><strong>Error Message:</strong> ${submission.errorMessage}</p>` : ''}
      </div>
      
      <p>You can view the full details and logs for this submission in the FormFlow Automation Suite dashboard.</p>
      
      <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
        This is an automated message from the FormFlow Automation Suite. Please do not reply to this email.
      </p>
    </div>
  `;
  
  // Send the email
  return sendEmail(recipients, subject, html);
}

/**
 * Sends a welcome email to a new user
 * @param user - The new user
 * @param password - The user's initial password
 * @returns Promise indicating if the email was sent successfully
 */
export async function sendWelcomeEmail(
  user: User,
  password: string
): Promise<boolean> {
  const subject = 'Welcome to FormFlow Automation Suite';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0284c7;">Welcome to FormFlow Automation Suite</h2>
      <p>Hello ${user.name},</p>
      
      <p>Your account has been created with the following details:</p>
      
      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><strong>Role:</strong> ${user.role}</p>
      </div>
      
      <p>Please log in to the FormFlow Automation Suite dashboard and change your password as soon as possible.</p>
      
      <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
        This is an automated message from the FormFlow Automation Suite. Please do not reply to this email.
      </p>
    </div>
  `;
  
  // Send the email
  return sendEmail(user.email, subject, html);
}
