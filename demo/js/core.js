/**
 * FormFlow Automation Suite - Core Functionality
 * This file contains the core functionality for the FormFlow demo
 */

// Global state management
const FormFlowState = {
  // Current user information
  user: null,
  
  // Form data storage
  forms: [],
  
  // Submission history
  submissions: [],
  
  // System logs
  logs: [],
  
  // Initialize the state from localStorage
  init() {
    // Load data from localStorage if available
    try {
      const savedUser = localStorage.getItem('formflow_user');
      const savedForms = localStorage.getItem('formflow_forms');
      const savedSubmissions = localStorage.getItem('formflow_submissions');
      const savedLogs = localStorage.getItem('formflow_logs');
      
      if (savedUser) this.user = JSON.parse(savedUser);
      if (savedForms) this.forms = JSON.parse(savedForms);
      if (savedSubmissions) this.submissions = JSON.parse(savedSubmissions);
      if (savedLogs) this.logs = JSON.parse(savedLogs);
      
      // If no data exists, initialize with sample data
      if (!this.forms.length) this.initSampleData();
      
      console.log('FormFlow state initialized');
    } catch (error) {
      console.error('Error initializing FormFlow state:', error);
      this.initSampleData();
    }
    
    // Add event to save state before page unload
    window.addEventListener('beforeunload', () => this.saveState());
  },
  
  // Save the current state to localStorage
  saveState() {
    try {
      localStorage.setItem('formflow_user', JSON.stringify(this.user));
      localStorage.setItem('formflow_forms', JSON.stringify(this.forms));
      localStorage.setItem('formflow_submissions', JSON.stringify(this.submissions));
      localStorage.setItem('formflow_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Error saving FormFlow state:', error);
    }
  },
  
  // Initialize with sample data if no data exists
  initSampleData() {
    // Sample user
    this.user = {
      id: 'user-1',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'admin'
    };
    
    // Sample forms
    this.forms = [
      {
        id: 'form-123',
        name: 'vehicle-registration.pdf',
        uploadedAt: '2025-05-16T10:30:00',
        status: 'completed',
        fileSize: 1024 * 1024 * 2.5, // 2.5 MB
        fields: {
          owner: 'John Smith',
          address: '123 Main St, Anytown, CA 12345',
          vehicle: 'Toyota Camry',
          year: '2023',
          vin: 'JT2BF22K1W0123456'
        }
      },
      {
        id: 'form-456',
        name: 'license-renewal.pdf',
        uploadedAt: '2025-05-15T14:45:00',
        status: 'pending',
        fileSize: 1024 * 1024 * 1.8, // 1.8 MB
        fields: {
          name: 'Jane Doe',
          dob: '1985-03-22',
          licenseNumber: 'DL98765432',
          expiryDate: '2025-03-22'
        }
      },
      {
        id: 'form-789',
        name: 'tax-filing.pdf',
        uploadedAt: '2025-05-14T09:15:00',
        status: 'failed',
        fileSize: 1024 * 1024 * 3.2, // 3.2 MB
        fields: {
          taxpayerId: 'TX123456789',
          taxYear: '2024',
          income: '$75,000',
          deductions: '$12,500'
        }
      }
    ];
    
    // Sample submissions
    this.submissions = [
      {
        id: 'sub-123',
        formId: 'form-123',
        submittedAt: '2025-05-16T11:15:00',
        status: 'completed',
        destination: 'DMV Vehicle Registration Portal',
        responseCode: 200,
        message: 'Registration successful'
      },
      {
        id: 'sub-456',
        formId: 'form-456',
        submittedAt: '2025-05-15T15:30:00',
        status: 'pending',
        destination: 'Driver License Renewal System',
        responseCode: null,
        message: 'Awaiting processing'
      },
      {
        id: 'sub-789',
        formId: 'form-789',
        submittedAt: '2025-05-14T09:45:00',
        status: 'failed',
        destination: 'Tax Filing System',
        responseCode: 500,
        message: 'Internal server error'
      }
    ];
    
    // Sample logs (will be populated more in the logs.js file)
    this.logs = [];
  },
  
  // Add a new form
  addForm(form) {
    this.forms.push(form);
    this.saveState();
    this.addLog({
      level: 'info',
      message: `Form uploaded: ${form.name}`,
      source: 'upload-service',
      formId: form.id
    });
    return form;
  },
  
  // Add a new submission
  addSubmission(submission) {
    this.submissions.push(submission);
    
    // Update the related form status
    const form = this.forms.find(f => f.id === submission.formId);
    if (form) {
      form.status = submission.status;
    }
    
    this.saveState();
    this.addLog({
      level: submission.status === 'completed' ? 'success' : 
             submission.status === 'failed' ? 'error' : 'info',
      message: `Submission ${submission.status}: ${submission.message}`,
      source: 'automation-service',
      formId: submission.formId
    });
    return submission;
  },
  
  // Add a new log entry
  addLog(log) {
    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    
    this.logs.push(newLog);
    this.saveState();
    return newLog;
  },
  
  // Get forms with optional filtering
  getForms(filter = {}) {
    let result = [...this.forms];
    
    if (filter.status) {
      result = result.filter(form => form.status === filter.status);
    }
    
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(form => 
        form.name.toLowerCase().includes(searchLower) ||
        (form.fields && Object.values(form.fields).some(value => 
          String(value).toLowerCase().includes(searchLower)
        ))
      );
    }
    
    // Sort by date, newest first
    result.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    return result;
  },
  
  // Get submissions with optional filtering
  getSubmissions(filter = {}) {
    let result = [...this.submissions];
    
    if (filter.formId) {
      result = result.filter(sub => sub.formId === filter.formId);
    }
    
    if (filter.status) {
      result = result.filter(sub => sub.status === filter.status);
    }
    
    // Sort by date, newest first
    result.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    return result;
  },
  
  // Get logs with optional filtering
  getLogs(filter = {}) {
    let result = [...this.logs];
    
    if (filter.level && filter.level !== 'all') {
      result = result.filter(log => log.level === filter.level);
    }
    
    if (filter.formId) {
      result = result.filter(log => log.formId === filter.formId);
    }
    
    if (filter.source) {
      result = result.filter(log => log.source === filter.source);
    }
    
    if (filter.date) {
      const filterDate = new Date(filter.date);
      result = result.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.getFullYear() === filterDate.getFullYear() &&
               logDate.getMonth() === filterDate.getMonth() &&
               logDate.getDate() === filterDate.getDate();
      });
    }
    
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.source.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by date, newest first
    result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return result;
  },
  
  // Get statistics for dashboard
  getStats() {
    const totalForms = this.forms.length;
    const completedForms = this.forms.filter(form => form.status === 'completed').length;
    const pendingForms = this.forms.filter(form => form.status === 'pending').length;
    const failedForms = this.forms.filter(form => form.status === 'failed').length;
    
    return {
      totalForms,
      completedForms,
      pendingForms,
      failedForms
    };
  }
};

// UI Utilities
const UIUtils = {
  // Show a toast notification
  showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col space-y-2';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `p-3 rounded-lg shadow-lg flex items-center space-x-2 transition-all transform translate-x-full opacity-0 max-w-md`;
    
    // Set background color based on type
    switch (type) {
      case 'success':
        toast.classList.add('bg-green-100', 'text-green-800', 'border-l-4', 'border-green-500');
        break;
      case 'error':
        toast.classList.add('bg-red-100', 'text-red-800', 'border-l-4', 'border-red-500');
        break;
      case 'warning':
        toast.classList.add('bg-yellow-100', 'text-yellow-800', 'border-l-4', 'border-yellow-500');
        break;
      default:
        toast.classList.add('bg-blue-100', 'text-blue-800', 'border-l-4', 'border-blue-500');
    }
    
    // Create icon based on type
    let iconSvg = '';
    switch (type) {
      case 'success':
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>`;
        break;
      case 'error':
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>`;
        break;
      case 'warning':
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>`;
        break;
      default:
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>`;
    }
    
    // Set toast content
    toast.innerHTML = `
      <div class="flex-shrink-0">${iconSvg}</div>
      <div class="flex-grow">${message}</div>
      <button class="flex-shrink-0 text-gray-500 hover:text-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Add close button event
    toast.querySelector('button').addEventListener('click', () => {
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    });
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
    }, 10);
    
    // Auto remove after duration
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  },
  
  // Format a date string
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  },
  
  // Format file size
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  },
  
  // Get status badge HTML
  getStatusBadge(status) {
    let classes = '';
    switch (status) {
      case 'completed':
        classes = 'bg-green-100 text-green-800';
        break;
      case 'pending':
        classes = 'bg-yellow-100 text-yellow-800';
        break;
      case 'failed':
        classes = 'bg-red-100 text-red-800';
        break;
      default:
        classes = 'bg-gray-100 text-gray-800';
    }
    
    return `<span class="px-2 py-1 text-xs rounded-full ${classes}">${status}</span>`;
  },
  
  // Get log level badge HTML
  getLogLevelBadge(level) {
    let classes = '';
    switch (level) {
      case 'info':
        classes = 'bg-blue-100 text-blue-800';
        break;
      case 'success':
        classes = 'bg-green-100 text-green-800';
        break;
      case 'warning':
        classes = 'bg-yellow-100 text-yellow-800';
        break;
      case 'error':
        classes = 'bg-red-100 text-red-800';
        break;
      default:
        classes = 'bg-gray-100 text-gray-800';
    }
    
    return `<span class="px-2 py-1 text-xs rounded-full ${classes}">${level}</span>`;
  }
};

// Form validation utilities
const FormValidator = {
  // Validate email format
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  // Validate file type
  isValidFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  },
  
  // Validate file size
  isValidFileSize(file, maxSizeBytes) {
    return file.size <= maxSizeBytes;
  },
  
  // Show validation error
  showError(inputElement, message) {
    // Remove any existing error
    this.clearError(inputElement);
    
    // Create error message element
    const errorElement = document.createElement('p');
    errorElement.className = 'text-sm text-red-600 mt-1';
    errorElement.textContent = message;
    
    // Add error class to input
    inputElement.classList.add('border-red-500');
    
    // Insert error after input
    inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
  },
  
  // Clear validation error
  clearError(inputElement) {
    // Remove error class from input
    inputElement.classList.remove('border-red-500');
    
    // Remove error message if it exists
    const errorElement = inputElement.nextSibling;
    if (errorElement && errorElement.classList && errorElement.classList.contains('text-red-600')) {
      errorElement.remove();
    }
  }
};

// Initialize the state when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  FormFlowState.init();
});
