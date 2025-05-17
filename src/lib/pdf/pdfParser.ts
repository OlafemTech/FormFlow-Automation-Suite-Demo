import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import { FormData, SubmissionStatus } from '@/types';

/**
 * Extracts form field data from a PDF file
 * @param buffer - The PDF file buffer
 * @param fileName - Original filename of the PDF
 * @param uploadedBy - ID of the user who uploaded the PDF
 * @returns Promise with the extracted form data
 */
export async function extractPdfFormData(
  buffer: Buffer,
  fileName: string,
  uploadedBy: string
): Promise<FormData> {
  try {
    // Parse the PDF text content
    const pdfData = await pdfParse(buffer);
    
    // Load the PDF document using pdf-lib for form field extraction
    const pdfDoc = await PDFDocument.load(buffer);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    // Extract form field data
    const formFields: Record<string, any> = {};
    
    for (const field of fields) {
      const fieldName = field.getName();
      
      // Handle different field types
      if (field.constructor.name === 'PDFTextField') {
        const textField = form.getTextField(fieldName);
        formFields[fieldName] = textField.getText() || '';
      } else if (field.constructor.name === 'PDFCheckBox') {
        const checkBox = form.getCheckBox(fieldName);
        formFields[fieldName] = checkBox.isChecked();
      } else if (field.constructor.name === 'PDFRadioGroup') {
        const radioGroup = form.getRadioGroup(fieldName);
        formFields[fieldName] = radioGroup.getSelected() || '';
      } else if (field.constructor.name === 'PDFDropdown') {
        const dropdown = form.getDropdown(fieldName);
        formFields[fieldName] = dropdown.getSelected() || [];
      }
    }
    
    // If no form fields were found, attempt to extract data using text analysis
    if (Object.keys(formFields).length === 0) {
      // Simple key-value extraction from text content
      // This is a basic implementation and might need to be customized based on the PDF format
      const lines = pdfData.text.split('\n').filter(line => line.trim() !== '');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Look for patterns like "Label: Value" or "Label - Value"
        const match = line.match(/^(.*?)[:|-]\s*(.*)$/);
        
        if (match) {
          const [, key, value] = match;
          formFields[key.trim()] = value.trim();
        }
      }
    }
    
    // Create the form data object
    const formData: FormData = {
      id: generateUniqueId(),
      fileName,
      fileSize: buffer.length,
      uploadedBy,
      uploadedAt: new Date(),
      parsedData: formFields,
      status: SubmissionStatus.PENDING
    };
    
    return formData;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse PDF: ${(error as Error).message}`);
  }
}

/**
 * Validates the extracted form data to ensure all required fields are present
 * @param formData - The extracted form data
 * @param requiredFields - Array of field names that are required
 * @returns Object with validation result and any missing fields
 */
export function validateFormData(
  formData: FormData,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(
    field => !formData.parsedData[field] || formData.parsedData[field] === ''
  );
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Generates a unique ID for form data records
 * @returns A unique ID string
 */
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
