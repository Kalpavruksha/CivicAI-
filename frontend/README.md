# Civic RAG Frontend

This is a Next.js frontend for the Hubli-Dharwad Municipal Corporation RAG system.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to http://localhost:3000

## Environment Variables

Create a `.env.local` file with the following content:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This should match the URL where your RAG backend is running.

## Pages

- `/` - Landing page with link to dashboard
- `/dashboard` - Main interface to submit queries and view results/history

## Features

- Submit civic complaints and get AI-recommended actions
- View retrieved source documents for transparency
- History of previous queries stored in localStorage
- Responsive design