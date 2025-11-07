# Docitup

A full-stack journaling and goal tracking application built with React and Node.js.

## 🚀 Features

- **Journal Entries**: Create, edit, and manage personal journal entries
- **Goal Tracking**: Set and track your goals with progress monitoring
- **Community Feed**: Share and discover entries from the community
- **Task Management**: Calendar-based task management system
- **Media Upload**: Secure file uploads with Cloudflare R2 storage
- **Authentication**: Secure JWT-based authentication with OTP verification
- **Profile Management**: User profiles with public profile pages

## 📋 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **React Router** for routing
- **Radix UI** for accessible components
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **AWS SES** for email services
- **Cloudflare R2** for file storage
- **Multer** for file uploads

## 📁 Project Structure

```
docitup-main/
├── app/                    # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities and API client
│   │   └── main.tsx       # Entry point
│   ├── Dockerfile         # Frontend Docker configuration
│   └── package.json
├── backend/               # Backend Node.js API
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── utils/         # Utility functions
│   │   └── index.js       # Server entry point
│   ├── Dockerfile         # Backend Docker configuration
│   └── package.json
└── README.md
```

## 🛠️ Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **MongoDB** database (local or cloud)
- **AWS SES** credentials (for email)
- **Cloudflare R2** credentials (for file storage)
- **Docker** (optional, for containerized deployment)

## 📦 Installation

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional for local development):
```env
VITE_API_URL=http://localhost:5001
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/docitup

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# AWS SES Configuration
AWS_REGION=ap-south-1
AWS_SES_ACCESS_KEY_ID=your-access-key-id
AWS_SES_SECRET_ACCESS_KEY=your-secret-access-key
AWS_SES_FROM_EMAIL=no-reply@yourdomain.com

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=docitup
R2_PUBLIC_URL=https://your-bucket.r2.cloudflarestorage.com
```

4. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5001`

## 🐳 Docker Deployment

### Building Docker Images

#### Frontend
```bash
cd app
docker build -t docitup-frontend .
docker run -p 3000:3000 docitup-frontend
```

#### Backend
```bash
cd backend
docker build -t docitup-backend .
docker run -p 5001:5001 --env-file .env docitup-backend
```

### Docker Compose (Optional)

Create a `docker-compose.yml` in the root:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - PORT=5001
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
      - FRONTEND_URL=${FRONTEND_URL}
      - AWS_REGION=${AWS_REGION}
      - AWS_SES_ACCESS_KEY_ID=${AWS_SES_ACCESS_KEY_ID}
      - AWS_SES_SECRET_ACCESS_KEY=${AWS_SES_SECRET_ACCESS_KEY}
      - AWS_SES_FROM_EMAIL=${AWS_SES_FROM_EMAIL}
      - R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
      - R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
      - R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
      - R2_BUCKET_NAME=${R2_BUCKET_NAME}
      - R2_PUBLIC_URL=${R2_PUBLIC_URL}
    restart: unless-stopped

  frontend:
    build: ./app
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Journal Entries
- `GET /api/entries` - Get all entries
- `POST /api/entries` - Create a new entry
- `GET /api/entries/:id` - Get entry by ID
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create a new goal
- `GET /api/goals/:id` - Get goal by ID
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Community
- `GET /api/community/feed` - Get community feed
- `GET /api/community/my-feed` - Get user's feed
- `GET /api/community/profile/:userId` - Get public profile

### Media
- `POST /api/media/upload` - Upload file
- `GET /api/media/presigned-url` - Get presigned URL for upload

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🔐 Environment Variables

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment | `production` or `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/docitup` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://docitup.example.com` |
| `AWS_REGION` | AWS region for SES | `ap-south-1` |
| `AWS_SES_ACCESS_KEY_ID` | AWS SES access key | `AKIA...` |
| `AWS_SES_SECRET_ACCESS_KEY` | AWS SES secret key | `...` |
| `AWS_SES_FROM_EMAIL` | Email sender address | `no-reply@example.com` |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID | `...` |
| `R2_ACCESS_KEY_ID` | R2 access key ID | `...` |
| `R2_SECRET_ACCESS_KEY` | R2 secret access key | `...` |
| `R2_BUCKET_NAME` | R2 bucket name | `docitup` |
| `R2_PUBLIC_URL` | R2 public URL | `https://bucket.r2.cloudflarestorage.com` |

### Frontend Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5001` |

## 🚀 Development

### Frontend Development
```bash
cd app
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
npm run preview  # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
```

## 📝 Scripts

### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run migrate:base64-to-r2` - Migrate base64 images to R2 storage

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT in `.env` file
2. **MongoDB connection failed**: Check `MONGODB_URI` and ensure MongoDB is running
3. **CORS errors**: Verify `FRONTEND_URL` matches your frontend URL
4. **Email sending fails**: Check AWS SES credentials and region
5. **File upload fails**: Verify R2 credentials and bucket configuration

## 📄 License

This project is private and proprietary.

## 👥 Contributing

This is a private project. For contributions, please contact the project maintainers.

## 📞 Support

For issues and questions, please contact the development team.

