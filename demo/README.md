# FormFlow Automation Suite Demo

This is a static HTML demo of the FormFlow Automation Suite, showcasing the user interface and key functionality of the application.

## Overview

FormFlow Automation Suite is a comprehensive solution that automates the extraction of data from filled-out PDF forms and submits this data to government websites. This demo provides a visual representation of the user interface and simulates the core functionality.

## Demo Pages

The demo consists of the following pages:

1. **Dashboard** (`index.html`): Provides an overview of form submissions, statistics, and recent activity.
2. **Upload Form** (`upload.html`): Demonstrates the form upload, parsing, and submission process.
3. **Logs** (`logs.html`): Shows the logging system for tracking form processing and submission activities.

## How to Use the Demo

1. Open any of the HTML files in a web browser to view the demo.
2. Navigate between pages using the sidebar menu.
3. On the Upload Form page, you can:
   - Upload a PDF file (simulated)
   - View the parsed form data (mock data)
   - Submit the form to a government website (simulated)
4. On the Logs page, you can:
   - Filter logs by level and date
   - View detailed information about each log entry
   - Navigate through paginated log entries

## Note

This is a static HTML demo that simulates the functionality of the actual FormFlow Automation Suite. The real application is built with Next.js, TypeScript, and includes backend functionality for PDF parsing and web automation.

## Actual System Features

The complete FormFlow Automation Suite includes:

1. **PDF Form Data Extraction**:
   - Upload PDF forms
   - Extract data using pdf-lib and pdf-parse
   - Validate and transform extracted data

2. **Web Automation**:
   - Automate data submission to government websites using Puppeteer
   - Error handling and logging for submission processes

3. **User Interface**:
   - Responsive dashboard built with Next.js and TailwindCSS
   - Form uploads, submission tracking, and logging

4. **Logging System**:
   - Comprehensive logging for debugging and auditing
   - Support for different log levels (info, warning, error, success)

5. **Authentication**:
   - User authentication with NextAuth.js
   - Role-based access control
