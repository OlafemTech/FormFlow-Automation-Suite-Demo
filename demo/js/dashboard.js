/**
 * FormFlow Automation Suite - Dashboard Functionality
 * This file contains the functionality for the dashboard page
 */

// Dashboard page functionality
class DashboardPage {
  constructor() {
    // DOM elements
    this.statsContainer = document.getElementById('stats-container');
    this.recentFormsContainer = document.getElementById('recent-forms-container');
    this.uploadButton = document.getElementById('upload-button');
    
    // Initialize the page
    this.init();
  }
  
  // Initialize the page
  init() {
    // Update statistics
    this.updateStats();
    
    // Load recent forms
    this.loadRecentForms();
    
    // Add event listeners
    if (this.uploadButton) {
      this.uploadButton.addEventListener('click', () => {
        window.location.href = 'upload.html';
      });
    }
    
    // Add refresh button event listener
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        this.updateStats();
        this.loadRecentForms();
        UIUtils.showToast('Dashboard refreshed', 'info');
      });
    }
  }
  
  // Update statistics
  updateStats() {
    const stats = FormFlowState.getStats();
    
    // Update total forms
    const totalFormsElement = document.getElementById('total-forms');
    if (totalFormsElement) {
      totalFormsElement.textContent = stats.totalForms;
    }
    
    // Update completed forms
    const completedFormsElement = document.getElementById('completed-forms');
    if (completedFormsElement) {
      completedFormsElement.textContent = stats.completedForms;
    }
    
    // Update pending forms
    const pendingFormsElement = document.getElementById('pending-forms');
    if (pendingFormsElement) {
      pendingFormsElement.textContent = stats.pendingForms;
    }
    
    // Update failed forms
    const failedFormsElement = document.getElementById('failed-forms');
    if (failedFormsElement) {
      failedFormsElement.textContent = stats.failedForms;
    }
  }
  
  // Load recent forms
  loadRecentForms() {
    // Get recent forms (up to 5)
    const recentForms = FormFlowState.getForms().slice(0, 5);
    
    // Get the table body
    const tableBody = document.getElementById('recent-forms-table-body');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add forms to table
    recentForms.forEach(form => {
      const row = document.createElement('tr');
      
      // Count fields
      const fieldCount = form.fields ? Object.keys(form.fields).length : 0;
      
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
          <a href="#" class="view-form" data-form-id="${form.id}">${form.name}</a>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${UIUtils.formatDate(form.uploadedAt)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          ${UIUtils.getStatusBadge(form.status)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${fieldCount} fields
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <button class="text-blue-600 hover:text-blue-800 view-details" data-form-id="${form.id}">
            View Details
          </button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // Add event listeners to view details buttons
    document.querySelectorAll('.view-details, .view-form').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const formId = button.getAttribute('data-form-id');
        this.showFormDetails(formId);
      });
    });
    
    // Show empty state if no forms
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
      if (recentForms.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }
  }
  
  // Show form details in modal
  showFormDetails(formId) {
    const form = FormFlowState.forms.find(f => f.id === formId);
    if (!form) return;
    
    // Get or create modal
    let modal = document.getElementById('form-details-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'form-details-modal';
      modal.className = 'fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center hidden z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-2xl w-full mx-4 overflow-hidden">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-center border-b">
            <h3 id="modal-title" class="text-lg font-medium text-gray-900">Form Details</h3>
            <button id="close-modal" class="text-gray-400 hover:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="px-4 py-5 sm:p-6">
            <dl id="modal-content" class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <!-- Content will be inserted here -->
            </dl>
          </div>
          <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button id="modal-close-button" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Close
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Add event listeners to close buttons
      document.getElementById('close-modal').addEventListener('click', () => {
        modal.classList.add('hidden');
      });
      
      document.getElementById('modal-close-button').addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }
    
    // Update modal content
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
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
      <div class="sm:col-span-2">
        <dt class="text-sm font-medium text-gray-500">Form Fields</dt>
        <dd class="mt-1 text-sm text-gray-900">
          <div class="border border-gray-200 rounded-md overflow-hidden">
    `;
    
    // Add fields
    if (form.fields && Object.keys(form.fields).length > 0) {
      contentHTML += `<dl class="divide-y divide-gray-200">`;
      
      Object.entries(form.fields).forEach(([key, value]) => {
        const fieldName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        contentHTML += `
          <div class="py-3 px-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt class="text-sm font-medium text-gray-500">${fieldName}</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${value}</dd>
          </div>
        `;
      });
      
      contentHTML += `</dl>`;
    } else {
      contentHTML += `<p class="py-3 px-4 text-sm text-gray-500">No fields available</p>`;
    }
    
    contentHTML += `
          </div>
        </dd>
      </div>
    `;
    
    // Add submission information if available
    const submissions = FormFlowState.getSubmissions({ formId: form.id });
    if (submissions.length > 0) {
      const latestSubmission = submissions[0];
      
      contentHTML += `
        <div class="sm:col-span-2">
          <dt class="text-sm font-medium text-gray-500">Submission Details</dt>
          <dd class="mt-1 text-sm text-gray-900">
            <div class="border border-gray-200 rounded-md overflow-hidden">
              <dl class="divide-y divide-gray-200">
                <div class="py-3 px-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt class="text-sm font-medium text-gray-500">Submitted At</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${UIUtils.formatDate(latestSubmission.submittedAt)}</dd>
                </div>
                <div class="py-3 px-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt class="text-sm font-medium text-gray-500">Destination</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${latestSubmission.destination}</dd>
                </div>
                <div class="py-3 px-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt class="text-sm font-medium text-gray-500">Status</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${UIUtils.getStatusBadge(latestSubmission.status)}</dd>
                </div>
                <div class="py-3 px-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt class="text-sm font-medium text-gray-500">Response Code</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${latestSubmission.responseCode || 'N/A'}</dd>
                </div>
                <div class="py-3 px-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt class="text-sm font-medium text-gray-500">Message</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${latestSubmission.message}</dd>
                </div>
              </dl>
            </div>
          </dd>
        </div>
      `;
    }
    
    // Set content and show modal
    modalContent.innerHTML = contentHTML;
    modal.classList.remove('hidden');
  }
}

// Initialize the dashboard page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're on the dashboard page
  if (document.getElementById('dashboard-page')) {
    const dashboardPage = new DashboardPage();
  }
});
