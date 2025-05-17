/**
 * FormFlow Automation Suite - Logs Functionality
 * This file contains the functionality for the logs page
 */

// Logs page functionality
class LogsPage {
  constructor() {
    // Current page and filters
    this.currentPage = 1;
    this.pageSize = 10;
    this.levelFilter = 'all';
    this.dateFilter = null;
    this.sourceFilter = null;
    this.searchQuery = '';
    
    // DOM elements
    this.logsTableBody = document.getElementById('logs-table-body');
    this.levelFilterSelect = document.getElementById('level-filter');
    this.dateFilterInput = document.getElementById('date-filter');
    this.sourceFilterSelect = document.getElementById('source-filter');
    this.searchInput = document.getElementById('search-input');
    this.clearFiltersButton = document.getElementById('clear-filters');
    this.prevPageButton = document.getElementById('prev-page');
    this.nextPageButton = document.getElementById('next-page');
    this.showingText = document.getElementById('showing-text');
    this.logDetailsModal = document.getElementById('log-details-modal');
    this.closeModalButton = document.getElementById('close-modal');
    
    // Initialize the page
    this.init();
  }
  
  // Initialize the page
  init() {
    // Add sample logs if none exist
    if (FormFlowState.logs.length === 0) {
      this.addSampleLogs();
    }
    
    // Set up event listeners
    if (this.levelFilterSelect) {
      this.levelFilterSelect.addEventListener('change', () => {
        this.levelFilter = this.levelFilterSelect.value;
        this.currentPage = 1;
        this.renderLogs();
      });
    }
    
    if (this.dateFilterInput) {
      this.dateFilterInput.addEventListener('change', () => {
        this.dateFilter = this.dateFilterInput.value ? this.dateFilterInput.value : null;
        this.currentPage = 1;
        this.renderLogs();
      });
    }
    
    if (this.sourceFilterSelect) {
      this.sourceFilterSelect.addEventListener('change', () => {
        this.sourceFilter = this.sourceFilterSelect.value === 'all' ? null : this.sourceFilterSelect.value;
        this.currentPage = 1;
        this.renderLogs();
      });
    }
    
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => {
        this.searchQuery = this.searchInput.value;
        this.currentPage = 1;
        this.renderLogs();
      });
    }
    
    if (this.clearFiltersButton) {
      this.clearFiltersButton.addEventListener('click', () => {
        this.levelFilter = 'all';
        this.dateFilter = null;
        this.sourceFilter = null;
        this.searchQuery = '';
        
        if (this.levelFilterSelect) this.levelFilterSelect.value = 'all';
        if (this.dateFilterInput) this.dateFilterInput.value = '';
        if (this.sourceFilterSelect) this.sourceFilterSelect.value = 'all';
        if (this.searchInput) this.searchInput.value = '';
        
        this.currentPage = 1;
        this.renderLogs();
        
        UIUtils.showToast('Filters cleared', 'info');
      });
    }
    
    if (this.prevPageButton) {
      this.prevPageButton.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderLogs();
        }
      });
    }
    
    if (this.nextPageButton) {
      this.nextPageButton.addEventListener('click', () => {
        const filteredLogs = this.getFilteredLogs();
        const totalPages = Math.ceil(filteredLogs.length / this.pageSize);
        
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderLogs();
        }
      });
    }
    
    if (this.closeModalButton) {
      this.closeModalButton.addEventListener('click', () => {
        if (this.logDetailsModal) this.logDetailsModal.classList.add('hidden');
      });
    }
    
    // Populate source filter options
    this.populateSourceFilter();
    
    // Initial render
    this.renderLogs();
  }
  
  // Add sample logs if none exist
  addSampleLogs() {
    const sampleLogs = [
      {
        level: 'info',
        message: 'Form uploaded successfully',
        source: 'upload-service',
        formId: 'form-123',
        stackTrace: null
      },
      {
        level: 'info',
        message: 'PDF parsing started',
        source: 'pdf-parser',
        formId: 'form-123',
        stackTrace: null
      },
      {
        level: 'success',
        message: 'PDF parsing completed',
        source: 'pdf-parser',
        formId: 'form-123',
        stackTrace: null
      },
      {
        level: 'info',
        message: 'Submission to government website initiated',
        source: 'automation-service',
        formId: 'form-123',
        stackTrace: null
      },
      {
        level: 'success',
        message: 'Submission completed successfully',
        source: 'automation-service',
        formId: 'form-123',
        stackTrace: null
      },
      {
        level: 'info',
        message: 'Form uploaded successfully',
        source: 'upload-service',
        formId: 'form-456',
        stackTrace: null
      },
      {
        level: 'info',
        message: 'PDF parsing started',
        source: 'pdf-parser',
        formId: 'form-456',
        stackTrace: null
      },
      {
        level: 'warning',
        message: 'Some fields could not be parsed automatically',
        source: 'pdf-parser',
        formId: 'form-456',
        stackTrace: 'Warning: Fields "address2" and "phoneExtension" were not found in the form.'
      },
      {
        level: 'info',
        message: 'Submission to government website initiated',
        source: 'automation-service',
        formId: 'form-456',
        stackTrace: null
      },
      {
        level: 'error',
        message: 'Submission failed: Website timeout',
        source: 'automation-service',
        formId: 'form-456',
        stackTrace: 'Error: Timeout while waiting for response from government website.\nAt: AutomationService.submitForm (line 127)\nAt: SubmissionController.processSubmission (line 45)'
      },
      {
        level: 'info',
        message: 'Form uploaded successfully',
        source: 'upload-service',
        formId: 'form-789',
        stackTrace: null
      },
      {
        level: 'error',
        message: 'PDF parsing failed: Invalid form format',
        source: 'pdf-parser',
        formId: 'form-789',
        stackTrace: 'Error: Could not identify form template.\nAt: PDFParser.identifyTemplate (line 45)\nAt: PDFParser.parseForm (line 23)\nAt: FormController.processUpload (line 78)'
      },
      {
        level: 'info',
        message: 'System startup',
        source: 'system',
        formId: null,
        stackTrace: null
      },
      {
        level: 'info',
        message: 'User login: admin@example.com',
        source: 'auth-service',
        formId: null,
        stackTrace: null
      },
      {
        level: 'warning',
        message: 'Failed login attempt: unknown@example.com',
        source: 'auth-service',
        formId: null,
        stackTrace: 'Warning: Multiple failed login attempts detected from IP 192.168.1.100'
      }
    ];
    
    // Add sample logs with timestamps spread over the last 3 days
    const now = new Date();
    
    sampleLogs.forEach((log, index) => {
      const timestamp = new Date(now);
      timestamp.setHours(timestamp.getHours() - (index * 2));
      
      FormFlowState.addLog({
        ...log,
        timestamp: timestamp.toISOString()
      });
    });
  }
  
  // Populate source filter options
  populateSourceFilter() {
    if (!this.sourceFilterSelect) return;
    
    // Get unique sources
    const sources = [...new Set(FormFlowState.logs.map(log => log.source))];
    
    // Clear existing options (except 'All Sources')
    while (this.sourceFilterSelect.options.length > 1) {
      this.sourceFilterSelect.remove(1);
    }
    
    // Add source options
    sources.forEach(source => {
      const option = document.createElement('option');
      option.value = source;
      option.textContent = source.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      this.sourceFilterSelect.appendChild(option);
    });
  }
  
  // Get filtered logs
  getFilteredLogs() {
    const filter = {
      level: this.levelFilter !== 'all' ? this.levelFilter : null,
      source: this.sourceFilter,
      date: this.dateFilter,
      search: this.searchQuery || null
    };
    
    return FormFlowState.getLogs(filter);
  }
  
  // Render logs table
  renderLogs() {
    if (!this.logsTableBody) return;
    
    const filteredLogs = this.getFilteredLogs();
    const totalPages = Math.ceil(filteredLogs.length / this.pageSize);
    
    // Calculate pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, filteredLogs.length);
    const currentLogs = filteredLogs.slice(startIndex, endIndex);
    
    // Update pagination text
    if (this.showingText) {
      this.showingText.innerHTML = `
        Showing <span class="font-medium">${filteredLogs.length > 0 ? startIndex + 1 : 0}</span> to 
        <span class="font-medium">${endIndex}</span> of 
        <span class="font-medium">${filteredLogs.length}</span> results
      `;
    }
    
    // Update pagination buttons
    if (this.prevPageButton) {
      this.prevPageButton.disabled = this.currentPage === 1;
      this.prevPageButton.classList.toggle('opacity-50', this.currentPage === 1);
    }
    
    if (this.nextPageButton) {
      this.nextPageButton.disabled = this.currentPage === totalPages || totalPages === 0;
      this.nextPageButton.classList.toggle('opacity-50', this.currentPage === totalPages || totalPages === 0);
    }
    
    // Clear table
    this.logsTableBody.innerHTML = '';
    
    // Show empty state if no logs
    if (currentLogs.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="5" class="px-6 py-10 text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="mt-2 font-medium">No logs found</p>
          <p class="mt-1">Try changing your filters or check back later</p>
        </td>
      `;
      this.logsTableBody.appendChild(emptyRow);
      return;
    }
    
    // Add logs to table
    currentLogs.forEach(log => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${UIUtils.formatDate(log.timestamp)}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          ${UIUtils.getLogLevelBadge(log.level)}
        </td>
        <td class="px-6 py-4 text-sm text-gray-900">${log.message}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${log.source}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <button class="text-blue-600 hover:text-blue-800 view-log-details" data-log-id="${log.id}">
            View Details
          </button>
        </td>
      `;
      
      this.logsTableBody.appendChild(row);
    });
    
    // Add event listeners to detail buttons
    document.querySelectorAll('.view-log-details').forEach(button => {
      button.addEventListener('click', () => {
        const logId = button.getAttribute('data-log-id');
        this.showLogDetails(logId);
      });
    });
  }
  
  // Show log details in modal
  showLogDetails(logId) {
    const log = FormFlowState.logs.find(l => l.id === logId);
    if (!log || !this.logDetailsModal) return;
    
    // Update modal content
    document.getElementById('modal-timestamp').textContent = UIUtils.formatDate(log.timestamp);
    document.getElementById('modal-level').innerHTML = UIUtils.getLogLevelBadge(log.level);
    document.getElementById('modal-message').textContent = log.message;
    document.getElementById('modal-source').textContent = log.source;
    
    // Form ID (may be null)
    const formIdElement = document.getElementById('modal-form-id');
    if (formIdElement) {
      formIdElement.textContent = log.formId || 'N/A';
      
      // If there's a form ID, add a link to view form details
      if (log.formId) {
        const form = FormFlowState.forms.find(f => f.id === log.formId);
        if (form) {
          formIdElement.innerHTML = `
            <a href="#" class="text-blue-600 hover:text-blue-800 view-form-details" data-form-id="${log.formId}">
              ${log.formId} (${form.name})
            </a>
          `;
          
          // Add event listener after rendering
          setTimeout(() => {
            const formLink = document.querySelector('.view-form-details');
            if (formLink) {
              formLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.viewFormDetails(log.formId);
              });
            }
          }, 0);
        }
      }
    }
    
    // Stack trace (may be null)
    const stackTraceElement = document.getElementById('modal-stack-trace');
    if (stackTraceElement) {
      stackTraceElement.textContent = log.stackTrace || 'No stack trace available';
      
      // If no stack trace, hide the container
      const stackTraceContainer = stackTraceElement.closest('.sm\\:col-span-2');
      if (stackTraceContainer) {
        stackTraceContainer.style.display = log.stackTrace ? 'block' : 'none';
      }
    }
    
    // Show modal
    this.logDetailsModal.classList.remove('hidden');
  }
  
  // View form details from log modal
  viewFormDetails(formId) {
    // Hide log modal
    if (this.logDetailsModal) {
      this.logDetailsModal.classList.add('hidden');
    }
    
    // Create or get form details modal
    let formModal = document.getElementById('form-details-modal');
    if (!formModal) {
      formModal = document.createElement('div');
      formModal.id = 'form-details-modal';
      formModal.className = 'fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center hidden z-50';
      formModal.innerHTML = `
        <div class="bg-white rounded-lg max-w-2xl w-full mx-4 overflow-hidden">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-center border-b">
            <h3 id="form-modal-title" class="text-lg font-medium text-gray-900">Form Details</h3>
            <button id="close-form-modal" class="text-gray-400 hover:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="px-4 py-5 sm:p-6">
            <dl id="form-modal-content" class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <!-- Content will be inserted here -->
            </dl>
          </div>
          <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button id="form-modal-close-button" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Close
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(formModal);
      
      // Add event listeners to close buttons
      document.getElementById('close-form-modal').addEventListener('click', () => {
        formModal.classList.add('hidden');
      });
      
      document.getElementById('form-modal-close-button').addEventListener('click', () => {
        formModal.classList.add('hidden');
      });
    }
    
    const form = FormFlowState.forms.find(f => f.id === formId);
    if (!form) return;
    
    // Update modal content
    const modalTitle = document.getElementById('form-modal-title');
    const modalContent = document.getElementById('form-modal-content');
    
    modalTitle.textContent = form.name;
    
    // Build content HTML
    let contentHTML = `
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Upload Date</dt>
        <dd class="mt-1 text-sm text-gray-900">${UIUtils.formatDate(form.uploadedAt)}</dd>
      </div>
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Status</dt>
        <dd class="mt-1 text-sm text-gray-900">${UIUtils.getStatusBadge(form.status)}</dd>
      </div>
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">File Size</dt>
        <dd class="mt-1 text-sm text-gray-900">${UIUtils.formatFileSize(form.fileSize)}</dd>
      </div>
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Form ID</dt>
        <dd class="mt-1 text-sm text-gray-900">${form.id}</dd>
      </div>
    `;
    
    // Add fields if available
    if (form.fields && Object.keys(form.fields).length > 0) {
      contentHTML += `
        <div class="sm:col-span-2">
          <dt class="text-sm font-medium text-gray-500">Form Fields</dt>
          <dd class="mt-1 text-sm text-gray-900">
            <div class="border border-gray-200 rounded-md overflow-hidden">
              <dl class="divide-y divide-gray-200">
      `;
      
      Object.entries(form.fields).forEach(([key, value]) => {
        const fieldName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        contentHTML += `
          <div class="py-3 px-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt class="text-sm font-medium text-gray-500">${fieldName}</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${value}</dd>
          </div>
        `;
      });
      
      contentHTML += `
              </dl>
            </div>
          </dd>
        </div>
      `;
    }
    
    // Set content and show modal
    modalContent.innerHTML = contentHTML;
    formModal.classList.remove('hidden');
  }
}

// Initialize the logs page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're on the logs page
  if (document.getElementById('logs-page')) {
    const logsPage = new LogsPage();
  }
});
