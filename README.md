# FormFlow Automation Suite

A complete solution for automating PDF form data extraction and submission to government websites.

## Features

- **PDF Form Data Extraction**: Upload and parse filled-out PDF forms using pdf-lib and pdf-parse
- **Form Submission Automation**: Automate data entry into government websites using Puppeteer
- **Dashboard Interface**: Modern UI built with Next.js and TailwindCSS
- **Submission Tracking**: Monitor the status of all form submissions
- **Detailed Logging**: Comprehensive logging system for debugging and auditing
- **Email Notifications**: Get notified when submissions succeed or fail
- **Authentication**: Secure access for internal staff only

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: SQLite (via sqlite3)
- **PDF Processing**: pdf-lib, pdf-parse
- **Web Automation**: Puppeteer
- **Authentication**: NextAuth.js
- **Email**: Custom email utility (can be integrated with SendGrid, Mailgun, etc.)
- **Logging**: Winston + custom logging system

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd formflow-automation-suite
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Credentials

- **Admin User**: admin@example.com / admin123
- **Staff User**: staff@example.com / staff123

## Project Structure

```
formflow-automation-suite/
├── src/
│   ├── components/       # React components
│   ├── lib/
│   │   ├── pdf/          # PDF parsing utilities
│   │   └── automation/   # Puppeteer automation code
│   ├── pages/
│   │   ├── api/          # API routes
│   │   │   ├── auth/     # Authentication endpoints
│   │   │   ├── uploads/  # Form upload endpoints
│   │   │   ├── submissions/ # Submission endpoints
│   │   │   └── logs/     # Logging endpoints
│   │   ├── _app.tsx      # Next.js App component
│   │   ├── index.tsx     # Dashboard page
│   │   ├── upload.tsx    # Form upload page
│   │   ├── submissions.tsx # Submissions page
│   │   └── logs.tsx      # Logs page
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── public/               # Static assets
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Usage Guide

### Uploading a PDF Form

1. Navigate to the "Upload Form" page
2. Drag and drop a PDF form or click to select a file
3. Click "Upload and Parse" to extract data from the form
4. Review the extracted data
5. Click "Submit to Government Website" to start the automation process

### Monitoring Submissions

1. Navigate to the "Submissions" page to see all form submissions
2. Use filters to find specific submissions
3. Click on a submission to view details
4. For failed submissions, you can click "Retry" to attempt again

### Viewing Logs

1. Navigate to the "Logs" page to see system logs
2. Use filters to find specific log entries
3. Logs are color-coded by level (info, warning, error, success)

## Customization

### Adding New Form Types

To add support for a new type of PDF form:

1. Create a custom parser in `src/lib/pdf/` if needed
2. Add field mappings in `src/lib/automation/formSubmitter.ts`
3. Test with sample PDFs

### Adding New Government Websites

To add support for a new government website:

1. Create a new configuration in `src/lib/automation/` with:
   - URL
   - Field mappings
   - Submit button selector
   - Success/error indicators
   - Any pre/post submission steps

## Security Considerations

- All PDF processing is done server-side
- Authentication is required for all operations
- Role-based access control limits what users can do
- Sensitive data is not stored long-term
- Puppeteer runs in a secure, isolated environment

## License

This project is licensed under the ISC License.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Puppeteer](https://pptr.dev/)
- [pdf-lib](https://pdf-lib.js.org/)
- [NextAuth.js](https://next-auth.js.org/)
