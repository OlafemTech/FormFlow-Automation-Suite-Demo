import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withAuth } from '@/utils/auth';
import { extractPdfFormData } from '@/lib/pdf/pdfParser';
import { saveFormData } from '@/utils/database';
import { createLogEntry } from '@/utils/logger';
import { LogLevel } from '@/types';
import formidable from 'formidable';
import fs from 'fs';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * API handler for uploading and parsing PDF forms
 */
export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = formidable({ keepExtensions: true });
    
    const parseForm = (): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve({ fields, files });
        });
      });
    };
    
    const { files } = await parseForm();
    const file = files.file as formidable.File;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Check if the file is a PDF
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }
    
    // Read the file buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Extract form data from the PDF
    const formData = await extractPdfFormData(
      fileBuffer,
      file.originalFilename || 'unknown.pdf',
      user.id
    );
    
    // Save the form data to the database
    const savedFormData = await saveFormData(formData);
    
    // Log the form upload
    await createLogEntry({
      level: LogLevel.INFO,
      message: `Form uploaded and parsed: ${file.originalFilename}`,
      userId: user.id,
      metadata: {
        fileName: file.originalFilename,
        fileSize: file.size,
        fieldCount: Object.keys(formData.parsedData).length,
      },
    });
    
    // Clean up the temporary file
    fs.unlinkSync(file.filepath);
    
    return res.status(200).json({ success: true, formData: savedFormData });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Log the error
    await createLogEntry({
      level: LogLevel.ERROR,
      message: `Form upload failed: ${(error as Error).message}`,
      userId: user.id,
      metadata: {
        stack: (error as Error).stack,
      },
    });
    
    return res.status(500).json({ error: 'Failed to upload and parse the form' });
  }
});
