# Notes App with Convex and Clerk

A full-stack notes application built with React, TypeScript, Convex, and Clerk Authentication.

## Features

- User authentication via Clerk
- Create, read, update, and delete notes
- Real-time updates using Convex
- Responsive UI with Tailwind CSS
- Soft delete functionality

## Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Convex account (https://convex.dev)
- Clerk account (https://clerk.dev)

## Getting Started

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (copy from `.env.example`):
   ```
   # Convex
   VITE_CONVEX_URL=your_convex_deployment_url
   
   # Clerk Authentication
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

4. Initialize Convex (if not already done):
   ```bash
   npx convex init
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Testing the API

You can test the Convex API functions using the Convex dashboard or via curl commands. Here are some examples:

#### List Notes (authenticated)
```bash
curl -X POST "YOUR_CONVEX_URL/list" \
  -H "Content-Type: application/json" \
  -d '{"showDeleted": false}' \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

#### Create a Note (authenticated)
```bash
curl -X POST "YOUR_CONVEX_URL/create" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test note content"}' \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

## Project Structure

- `/src` - React frontend code
  - `/components` - UI components
- `/convex` - Backend API and schema
  - `schema.ts` - Database schema
  - `notes.ts` - Query and mutation functions
  - `auth.ts` - Authentication utilities
