import puppeteer, { Browser, Page } from 'puppeteer';
import { FormData, Submission, SubmissionStatus, LogLevel } from '@/types';
import { createLogEntry } from '@/utils/logger';

interface FieldMapping {
  pdfField: string;
  selector: string;
  type: 'text' | 'select' | 'checkbox' | 'radio';
  transform?: (value: any) => any;
}

interface FormSubmissionConfig {
  url: string;
  fieldMappings: FieldMapping[];
  submitButtonSelector: string;
  successIndicator: string;
  errorIndicator?: string;
  preSubmitSteps?: ((page: Page, formData: FormData) => Promise<void>)[];
  postSubmitSteps?: ((page: Page, formData: FormData) => Promise<void>)[];
}

/**
 * Submits form data to a government website using Puppeteer
 * @param formData - The parsed form data to submit
 * @param submissionId - The ID of the submission record
 * @param userId - The ID of the user initiating the submission
 * @param config - Configuration for the form submission
 * @returns Promise with the updated submission status
 */
export async function submitFormToWebsite(
  formData: FormData,
  submissionId: string,
  userId: string,
  config: FormSubmissionConfig
): Promise<Submission> {
  let browser: Browser | null = null;
  let submission: Submission = {
    id: submissionId,
    formDataId: formData.id,
    submittedBy: userId,
    submittedAt: new Date(),
    status: SubmissionStatus.IN_PROGRESS,
    targetWebsite: config.url
  };
  
  try {
    // Log the start of the submission process
    await createLogEntry({
      level: LogLevel.INFO,
      message: `Starting form submission for ${formData.fileName}`,
      submissionId,
      userId,
      metadata: { targetUrl: config.url }
    });
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true, // Set to false for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set a reasonable timeout
    await page.setDefaultNavigationTimeout(60000);
    
    // Navigate to the target website
    await page.goto(config.url, { waitUntil: 'networkidle2' });
    
    // Log navigation success
    await createLogEntry({
      level: LogLevel.INFO,
      message: `Successfully navigated to target website`,
      submissionId,
      userId
    });
    
    // Execute any pre-submit steps if defined
    if (config.preSubmitSteps) {
      for (const step of config.preSubmitSteps) {
        await step(page, formData);
      }
    }
    
    // Fill in the form fields based on the mapping
    for (const mapping of config.fieldMappings) {
      const value = formData.parsedData[mapping.pdfField];
      
      // Skip if no value is found
      if (value === undefined || value === null) {
        continue;
      }
      
      // Apply transformation if provided
      const transformedValue = mapping.transform ? mapping.transform(value) : value;
      
      // Fill in the field based on its type
      await page.waitForSelector(mapping.selector);
      
      switch (mapping.type) {
        case 'text':
          await page.type(mapping.selector, String(transformedValue));
          break;
        case 'select':
          await page.select(mapping.selector, String(transformedValue));
          break;
        case 'checkbox':
          if (transformedValue) {
            await page.click(mapping.selector);
          }
          break;
        case 'radio':
          await page.click(`${mapping.selector}[value="${transformedValue}"]`);
          break;
      }
      
      // Small delay between field inputs to avoid detection as a bot
      await page.waitForTimeout(100 + Math.random() * 200);
    }
    
    // Log form filling completion
    await createLogEntry({
      level: LogLevel.INFO,
      message: `Completed filling form fields`,
      submissionId,
      userId
    });
    
    // Submit the form
    await Promise.all([
      page.click(config.submitButtonSelector),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    // Execute any post-submit steps if defined
    if (config.postSubmitSteps) {
      for (const step of config.postSubmitSteps) {
        await step(page, formData);
      }
    }
    
    // Check for success or error indicators
    const pageContent = await page.content();
    
    if (pageContent.includes(config.successIndicator)) {
      // Submission successful
      submission.status = SubmissionStatus.COMPLETED;
      submission.completedAt = new Date();
      
      await createLogEntry({
        level: LogLevel.SUCCESS,
        message: `Form submission successful`,
        submissionId,
        userId,
        metadata: { formData: formData.id }
      });
    } else if (config.errorIndicator && pageContent.includes(config.errorIndicator)) {
      // Submission failed due to form error
      submission.status = SubmissionStatus.FAILED;
      submission.errorMessage = 'Form submission error detected on the website';
      
      await createLogEntry({
        level: LogLevel.ERROR,
        message: `Form submission failed: Error indicator detected on page`,
        submissionId,
        userId
      });
    } else {
      // Uncertain outcome, mark as completed but log a warning
      submission.status = SubmissionStatus.COMPLETED;
      submission.completedAt = new Date();
      
      await createLogEntry({
        level: LogLevel.WARNING,
        message: `Form submission completed but success indicator not found`,
        submissionId,
        userId
      });
    }
    
    // Take a screenshot for record-keeping
    await page.screenshot({ 
      path: `./screenshots/${submissionId}.png`,
      fullPage: true 
    });
    
  } catch (error) {
    // Handle errors
    submission.status = SubmissionStatus.FAILED;
    submission.errorMessage = (error as Error).message;
    
    await createLogEntry({
      level: LogLevel.ERROR,
      message: `Form submission failed: ${(error as Error).message}`,
      submissionId,
      userId,
      metadata: { stack: (error as Error).stack }
    });
  } finally {
    // Close the browser
    if (browser) {
      await browser.close();
    }
    
    return submission;
  }
}

/**
 * Retries a failed submission
 * @param submissionId - The ID of the failed submission to retry
 * @param userId - The ID of the user initiating the retry
 * @returns Promise with the new submission status
 */
export async function retrySubmission(
  submissionId: string,
  formData: FormData,
  userId: string,
  config: FormSubmissionConfig
): Promise<Submission> {
  // Log the retry attempt
  await createLogEntry({
    level: LogLevel.INFO,
    message: `Retrying submission ${submissionId}`,
    submissionId,
    userId
  });
  
  // Create a new submission ID for the retry
  const newSubmissionId = `${submissionId}-retry-${Date.now()}`;
  
  // Submit the form again
  return submitFormToWebsite(formData, newSubmissionId, userId, config);
}
