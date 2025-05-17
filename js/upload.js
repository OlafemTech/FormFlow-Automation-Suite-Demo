/**
 * FormFlow Automation Suite - Upload Functionality
 * This file contains the functionality for the upload page
 */

// PDF Form Templates - Used to simulate different form types
const FormTemplates = {
  // Vehicle Registration form template
  vehicleRegistration: {
    name: "Vehicle Registration",
    fields: {
      owner: { label: "Owner Name", required: true },
      address: { label: "Address", required: true },
      vehicle: { label: "Vehicle Make/Model", required: true },
      year: { label: "Year", required: true },
      vin: { label: "VIN", required: true },
      licensePlate: { label: "License Plate", required: false },
      registrationDate: { label: "Registration Date", required: true }
    }
  },
  
  // License Renewal form template
  licenseRenewal: {
    name: "License Renewal",
    fields: {
      name: { label: "Full Name", required: true },
      dob: { label: "Date of Birth", required: true },
      licenseNumber: { label: "License Number", required: true },
      expiryDate: { label: "Expiry Date", required: true },
      address: { label: "Address", required: true },
      eyesight: { label: "Eyesight Test", required: false }
    }
  },
  
  // Tax Filing form template
  taxFiling: {
    name: "Tax Filing",
    fields: {
      taxpayerId: { label: "Taxpayer ID", required: true },
      taxYear: { label: "Tax Year", required: true },
      income: { label: "Income", required: true },
      deductions: { label: "Deductions", required: true },
      filingStatus: { label: "Filing Status", required: true },
      dependents: { label: "Dependents", required: false }
    }
  }
};

// Upload page functionality
class UploadPage {
  constructor() {
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.parsedData = null;
    this.formTemplate = null;
    this.formId = null;
    
    // DOM elements
    this.fileInput = document.getElementById('file-upload');
    this.dropZone = document.querySelector('.border-dashed');
    this.fileInfo = document.getElementById('file-info');
    this.fileName = document.getElementById('file-name');
    this.fileSize = document.getElementById('file-size');
    this.uploadButton = document.getElementById('upload-button');
    this.uploadProgress = document.getElementById('upload-progress');
    this.progressBar = document.getElementById('progress-bar-fill');
    this.progressText = document.getElementById('progress-text');
    this.parsedDataContainer = document.getElementById('parsed-data-container');
    this.parsedFileName = document.getElementById('parsed-file-name');
    this.parsedUploadTime = document.getElementById('parsed-upload-time');
    this.parsedFields = document.getElementById('parsed-fields');
    this.submitButton = document.getElementById('submit-button');
    
    // Initialize the page
    this.init();
  }
  
  // Initialize the page
  init() {
    // Add event listeners
    if (this.fileInput) {
      this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
    }
    
    if (this.dropZone) {
      this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
      this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
      this.dropZone.addEventListener('drop', this.handleDrop.bind(this));
    }
    
    if (this.uploadButton) {
      this.uploadButton.addEventListener('click', this.uploadAndParse.bind(this));
    }
    
    if (this.submitButton) {
      this.submitButton.addEventListener('click', this.submitToGovernment.bind(this));
    }
  }
  
  // Handle file selection from input
  handleFileSelect(event) {
    const file = event.target.files[0];
    this.validateAndSetFile(file);
  }
  
  // Handle drag over event
  handleDragOver(event) {
    event.preventDefault();
    this.dropZone.classList.add('border-blue-500');
  }
  
  // Handle drag leave event
  handleDragLeave(event) {
    event.preventDefault();
    this.dropZone.classList.remove('border-blue-500');
  }
  
  // Handle drop event
  handleDrop(event) {
    event.preventDefault();
    this.dropZone.classList.remove('border-blue-500');
    
    const file = event.dataTransfer.files[0];
    this.validateAndSetFile(file);
  }
  
  // Validate and set the selected file
  validateAndSetFile(file) {
    // Check if file exists
    if (!file) return;
    
    // Validate file type
    if (!FormValidator.isValidFileType(file, ['application/pdf'])) {
      UIUtils.showToast('Please select a PDF file', 'error');
      if (this.fileInput) this.fileInput.value = '';
      return;
    }
    
    // Validate file size (max 10MB)
    if (!FormValidator.isValidFileSize(file, 10 * 1024 * 1024)) {
      UIUtils.showToast('File size exceeds 10MB limit', 'error');
      if (this.fileInput) this.fileInput.value = '';
      return;
    }
    
    // Set the selected file
    this.selectedFile = file;
    
    // Show file info
    if (this.fileInfo) this.fileInfo.classList.remove('hidden');
    if (this.fileName) this.fileName.textContent = file.name;
    if (this.fileSize) this.fileSize.textContent = `(${UIUtils.formatFileSize(file.size)})`;
    
    // Show upload button
    if (this.uploadButton) this.uploadButton.classList.remove('hidden');
    
    UIUtils.showToast('File selected successfully', 'success');
  }
  
  // Upload and parse the PDF
  uploadAndParse() {
    if (!this.selectedFile) {
      UIUtils.showToast('Please select a file first', 'warning');
      return;
    }
    
    // Hide upload button
    if (this.uploadButton) this.uploadButton.classList.add('hidden');
    
    // Show progress bar
    if (this.uploadProgress) this.uploadProgress.classList.remove('hidden');
    
    // Generate a unique ID for this form
    this.formId = 'form-' + Date.now();
    
    // Add a log entry for upload start
    FormFlowState.addLog({
      level: 'info',
      message: `Starting upload of ${this.selectedFile.name}`,
      source: 'upload-service',
      formId: this.formId
    });
    
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      
      if (this.progressBar) this.progressBar.style.width = `${progress}%`;
      if (this.progressText) this.progressText.textContent = `Uploading... ${progress}%`;
      
      // Simulate random upload issues
      if (progress === 35 && Math.random() < 0.2) {
        // 20% chance of a temporary upload slowdown
        UIUtils.showToast('Upload speed reduced. Please wait...', 'warning');
        setTimeout(() => {
          UIUtils.showToast('Upload speed restored', 'info');
        }, 2000);
      }
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        
        if (this.progressText) this.progressText.textContent = 'Upload complete. Starting PDF parsing...';
        
        // Add a log entry for upload completion
        FormFlowState.addLog({
          level: 'info',
          message: `Upload completed for ${this.selectedFile.name}`,
          source: 'upload-service',
          formId: this.formId
        });
        
        // Start parsing after a short delay
        setTimeout(() => {
          this.simulateParsing();
        }, 500);
      }
    }, 150);
  }
  
  // Simulate PDF parsing
  simulateParsing() {
    if (this.progressText) this.progressText.textContent = 'Parsing PDF content...';
    
    // Add a log entry for parsing start
    FormFlowState.addLog({
      level: 'info',
      message: 'PDF parsing started',
      source: 'pdf-parser',
      formId: this.formId
    });
    
    // Determine which template to use based on filename
    const fileName = this.selectedFile.name.toLowerCase();
    let templateKey = 'vehicleRegistration'; // default
    
    if (fileName.includes('license') || fileName.includes('driver')) {
      templateKey = 'licenseRenewal';
    } else if (fileName.includes('tax') || fileName.includes('filing')) {
      templateKey = 'taxFiling';
    }
    
    this.formTemplate = FormTemplates[templateKey];
    
    // Simulate parsing delay (1-3 seconds)
    const parsingDelay = 1000 + Math.random() * 2000;
    
    setTimeout(() => {
      // Simulate parsing error (10% chance)
      if (Math.random() < 0.1) {
        this.handleParsingError();
        return;
      }
      
      // Simulate parsing warning (20% chance)
      const hasWarning = Math.random() < 0.2;
      if (hasWarning) {
        // Add a warning log
        FormFlowState.addLog({
          level: 'warning',
          message: 'Some fields could not be parsed automatically',
          source: 'pdf-parser',
          formId: this.formId,
          stackTrace: `Warning: Could not reliably extract some fields from the form.`
        });
        
        UIUtils.showToast('Some fields could not be parsed automatically', 'warning');
      }
      
      // Generate parsed data from template
      this.parsedData = {};
      Object.keys(this.formTemplate.fields).forEach(key => {
        // For required fields, always generate a value
        if (this.formTemplate.fields[key].required || Math.random() > 0.2) {
          this.parsedData[key] = this.generateMockValue(key, templateKey);
        }
      });
      
      // Add a log entry for parsing completion
      FormFlowState.addLog({
        level: 'success',
        message: 'PDF parsing completed successfully',
        source: 'pdf-parser',
        formId: this.formId
      });
      
      // Add the form to the state
      const newForm = {
        id: this.formId,
        name: this.selectedFile.name,
        uploadedAt: new Date().toISOString(),
        status: 'pending',
        fileSize: this.selectedFile.size,
        fields: this.parsedData,
        template: templateKey
      };
      
      FormFlowState.addForm(newForm);
      
      // Hide progress bar after a short delay
      setTimeout(() => {
        if (this.uploadProgress) this.uploadProgress.classList.add('hidden');
        
        // Show parsed data
        this.showParsedData();
        
        UIUtils.showToast('PDF parsed successfully', 'success');
      }, 500);
    }, parsingDelay);
  }
  
  // Handle parsing error
  handleParsingError() {
    // Add an error log
    FormFlowState.addLog({
      level: 'error',
      message: 'PDF parsing failed',
      source: 'pdf-parser',
      formId: this.formId,
      stackTrace: 'Error: Could not parse PDF content. The file may be corrupted or password protected.'
    });
    
    // Hide progress bar
    if (this.uploadProgress) this.uploadProgress.classList.add('hidden');
    
    // Reset file input
    if (this.fileInput) this.fileInput.value = '';
    if (this.fileInfo) this.fileInfo.classList.add('hidden');
    
    // Show error message
    UIUtils.showToast('Failed to parse PDF. The file may be corrupted or password protected.', 'error');
    
    // Add the form to the state with failed status
    const newForm = {
      id: this.formId,
      name: this.selectedFile.name,
      uploadedAt: new Date().toISOString(),
      status: 'failed',
      fileSize: this.selectedFile.size,
      fields: {},
      error: 'Parsing failed'
    };
    
    FormFlowState.addForm(newForm);
  }
  
  // Generate mock value for a field
  generateMockValue(field, templateType) {
    // Common fields
    if (field === 'name' || field === 'owner') {
      const names = ['John Smith', 'Jane Doe', 'Michael Johnson', 'Emily Williams', 'Robert Brown'];
      return names[Math.floor(Math.random() * names.length)];
    }
    
    if (field === 'address') {
      const addresses = [
        '123 Main St, Anytown, CA 12345',
        '456 Oak Ave, Springfield, NY 67890',
        '789 Pine Rd, Lakeside, TX 23456',
        '321 Maple Dr, Mountain View, CO 78901',
        '654 Cedar Ln, Riverside, FL 34567'
      ];
      return addresses[Math.floor(Math.random() * addresses.length)];
    }
    
    // Template-specific fields
    if (templateType === 'vehicleRegistration') {
      if (field === 'vehicle') {
        const vehicles = ['Toyota Camry', 'Honda Civic', 'Ford F-150', 'Chevrolet Malibu', 'Nissan Altima'];
        return vehicles[Math.floor(Math.random() * vehicles.length)];
      }
      
      if (field === 'year') {
        return String(2018 + Math.floor(Math.random() * 8)); // 2018-2025
      }
      
      if (field === 'vin') {
        return 'JT2BF' + Math.floor(10000000 + Math.random() * 90000000);
      }
      
      if (field === 'licensePlate') {
        const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const l1 = letters[Math.floor(Math.random() * letters.length)];
        const l2 = letters[Math.floor(Math.random() * letters.length)];
        const l3 = letters[Math.floor(Math.random() * letters.length)];
        const n = Math.floor(1000 + Math.random() * 9000);
        return `${l1}${l2}${l3}-${n}`;
      }
      
      if (field === 'registrationDate') {
        const date = new Date();
        date.setDate(date.getDate() + Math.floor(Math.random() * 365));
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      }
    }
    
    if (templateType === 'licenseRenewal') {
      if (field === 'dob') {
        const year = 1960 + Math.floor(Math.random() * 40);
        const month = 1 + Math.floor(Math.random() * 12);
        const day = 1 + Math.floor(Math.random() * 28);
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
      
      if (field === 'licenseNumber') {
        return 'DL' + Math.floor(10000000 + Math.random() * 90000000);
      }
      
      if (field === 'expiryDate') {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 4);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      }
      
      if (field === 'eyesight') {
        return Math.random() > 0.7 ? 'Passed' : 'Needs Review';
      }
    }
    
    if (templateType === 'taxFiling') {
      if (field === 'taxpayerId') {
        return 'TX' + Math.floor(100000000 + Math.random() * 900000000);
      }
      
      if (field === 'taxYear') {
        return String(2023 + Math.floor(Math.random() * 3)); // 2023-2025
      }
      
      if (field === 'income') {
        const amount = 40000 + Math.floor(Math.random() * 100000);
        return '$' + amount.toLocaleString();
      }
      
      if (field === 'deductions') {
        const amount = 5000 + Math.floor(Math.random() * 20000);
        return '$' + amount.toLocaleString();
      }
      
      if (field === 'filingStatus') {
        const statuses = ['Single', 'Married Filing Jointly', 'Married Filing Separately', 'Head of Household'];
        return statuses[Math.floor(Math.random() * statuses.length)];
      }
      
      if (field === 'dependents') {
        return String(Math.floor(Math.random() * 4));
      }
    }
    
    // Default fallback
    return 'Sample Value';
  }
  
  // Show the parsed data
  showParsedData() {
    // Show the parsed data container
    if (this.parsedDataContainer) this.parsedDataContainer.classList.remove('hidden');
    
    // Set file name and upload time
    if (this.parsedFileName) this.parsedFileName.textContent = this.selectedFile.name;
    if (this.parsedUploadTime) this.parsedUploadTime.textContent = `Uploaded at ${new Date().toLocaleString()}`;
    
    // Clear existing fields
    if (this.parsedFields) this.parsedFields.innerHTML = '';
    
    // Add fields
    if (this.parsedFields && this.parsedData) {
      Object.entries(this.parsedData).forEach(([key, value]) => {
        const fieldName = this.formTemplate.fields[key]?.label || 
                          key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        const fieldHtml = `
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">${fieldName}</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${value}</dd>
          </div>
        `;
        
        this.parsedFields.innerHTML += fieldHtml;
      });
    }
  }
  
  // Submit to government website
  submitToGovernment() {
    if (!this.formId || !this.parsedData) {
      UIUtils.showToast('No form data to submit', 'error');
      return;
    }
    
    // Disable the submit button
    if (this.submitButton) {
      this.submitButton.disabled = true;
      this.submitButton.textContent = 'Submitting...';
    }
    
    // Determine the destination based on form template
    let destination = 'Government Portal';
    if (this.formTemplate) {
      if (this.formTemplate === FormTemplates.vehicleRegistration) {
        destination = 'DMV Vehicle Registration Portal';
      } else if (this.formTemplate === FormTemplates.licenseRenewal) {
        destination = 'Driver License Renewal System';
      } else if (this.formTemplate === FormTemplates.taxFiling) {
        destination = 'Tax Filing System';
      }
    }
    
    // Add a log entry for submission start
    FormFlowState.addLog({
      level: 'info',
      message: `Submission to ${destination} initiated`,
      source: 'automation-service',
      formId: this.formId
    });
    
    UIUtils.showToast(`Submitting to ${destination}...`, 'info');
    
    // Simulate submission (3-5 seconds)
    const submissionDelay = 3000 + Math.random() * 2000;
    
    setTimeout(() => {
      // Simulate submission result (80% success, 20% failure)
      const isSuccess = Math.random() < 0.8;
      
      // Create submission object
      const submission = {
        id: 'sub-' + Date.now(),
        formId: this.formId,
        submittedAt: new Date().toISOString(),
        destination: destination,
        responseCode: isSuccess ? 200 : 500,
        message: isSuccess ? 'Submission successful' : 'Submission failed: Server error',
        status: isSuccess ? 'completed' : 'failed'
      };
      
      // Add the submission to the state
      FormFlowState.addSubmission(submission);
      
      // Re-enable the submit button
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.textContent = 'Submit to Government Website';
      }
      
      if (isSuccess) {
        UIUtils.showToast('Form submitted successfully!', 'success');
        
        // Reset the form after a delay
        setTimeout(() => {
          this.resetForm();
        }, 2000);
      } else {
        UIUtils.showToast('Submission failed. Please try again later.', 'error');
      }
    }, submissionDelay);
  }
  
  // Reset the form
  resetForm() {
    this.selectedFile = null;
    this.parsedData = null;
    this.formTemplate = null;
    this.formId = null;
    
    // Reset UI elements
    if (this.fileInput) this.fileInput.value = '';
    if (this.fileInfo) this.fileInfo.classList.add('hidden');
    if (this.parsedDataContainer) this.parsedDataContainer.classList.add('hidden');
    
    UIUtils.showToast('Form reset. Ready for next submission.', 'info');
  }
}

// Initialize the upload page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const uploadPage = new UploadPage();
});
