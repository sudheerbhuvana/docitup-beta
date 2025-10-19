# Docitup Setup Guide

## Quick Start

### 1. Database Setup

First, ensure PostgreSQL is installed and running. Create a database:

```sql
CREATE DATABASE docitup;
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://user:password@localhost:5432/docitup
OPENAI_API_KEY=your-openai-api-key
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

Run the database migration:

```bash
npm run migrate
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd app
npm install --legacy-peer-deps
```

Start the frontend development server:

```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## First Steps

1. Register a new account at http://localhost:3000/register
2. Log in and start creating journal entries
3. Set up your first goal
4. Explore the community to see public goals

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check your DATABASE_URL in `.env`
- Ensure the database exists

### Port Already in Use

- Backend: Change PORT in `.env`
- Frontend: Change port in `vite.config.ts` server.port

### OpenAI API Errors

- Verify your API key is correct
- Check your OpenAI account has credits
- Some features won't work without a valid key

## Development Notes

- The backend uses TypeScript with tsx for hot reloading
- The frontend uses Vite for fast development
- All UI components are from shadcn/ui
- The application follows a clean, privacy-focused design

