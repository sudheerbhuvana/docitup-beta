# Docitup Backend API

A powerful REST API for the Docitup journaling and goal-tracking application.

## 🚀 Tech Stack

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Storage**: Cloudflare R2 (S3-compatible)
- **Email**: Amazon SES
- **Authentication**: JWT

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB (local or MongoDB Atlas)
- Cloudflare R2 account (for media storage)
- Amazon SES configured (for emails)

## 🛠️ Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

Then edit `.env` with your configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/docitup
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/docitup

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Cloudflare R2
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=docitup-media
R2_PUBLIC_URL=https://your-bucket.r2.cloudflarestorage.com

# Amazon SES
AWS_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your-ses-access-key
AWS_SES_SECRET_ACCESS_KEY=your-ses-secret-key
FROM_EMAIL=noreply@docitup.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## 🎯 Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |

### Journal Entries

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/entries` | Get all user entries | Yes |
| GET | `/api/entries/:id` | Get specific entry | Yes |
| POST | `/api/entries` | Create new entry | Yes |
| PUT | `/api/entries/:id` | Update entry | Yes |
| DELETE | `/api/entries/:id` | Delete entry | Yes |

### Goals

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/goals` | Get all user goals | Yes |
| GET | `/api/goals/:id` | Get specific goal | Yes |
| POST | `/api/goals` | Create new goal | Yes |
| PUT | `/api/goals/:id` | Update goal | Yes |
| DELETE | `/api/goals/:id` | Delete goal | Yes |
| PATCH | `/api/goals/:id/steps/:stepId` | Update goal step | Yes |

### Community

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/community/profiles` | Get public profiles | Yes |
| GET | `/api/community/goals` | Get public goals | Yes |
| GET | `/api/community/profiles/:userId` | Get user public profile | Yes |

### Media

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/media/upload` | Upload files (images/videos) | Yes |
| DELETE | `/api/media/delete` | Delete file | Yes |
| POST | `/api/media/presigned-url` | Get presigned upload URL | Yes |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Check server status | No |

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📝 Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "fullName": "John Doe"
  }'
```

### Create Journal Entry
```bash
curl -X POST http://localhost:5000/api/entries \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Entry",
    "content": "Today was a great day!",
    "mood": "great",
    "tags": ["daily", "reflection"]
  }'
```

### Upload Media
```bash
curl -X POST http://localhost:5000/api/media/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@image1.jpg" \
  -F "files=@image2.png"
```

## 🗄️ Database Models

### User
- email (unique)
- password (hashed)
- username
- fullName
- profileImage
- bio
- isPublicProfile

### Entry
- userId (ref: User)
- title
- content
- mood (great/good/okay/bad/terrible)
- tags []
- media [] (R2 URLs)
- isDraft
- timestamps

### Goal
- userId (ref: User)
- title
- description
- category
- targetDate
- progressPercentage
- status (active/completed/archived)
- isPublic
- steps []
- timestamps

## 🔧 Configuration

### MongoDB Setup

**Local MongoDB**:
```bash
# Install MongoDB
# macOS
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Connection string
MONGODB_URI=mongodb://localhost:27017/docitup
```

**MongoDB Atlas** (Cloud):
1. Create account at mongodb.com
2. Create cluster
3. Get connection string
4. Add to `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/docitup
```

### Cloudflare R2 Setup

1. Go to Cloudflare Dashboard
2. Navigate to R2
3. Create bucket: `docitup-media`
4. Generate API tokens
5. Add to `.env`

### Amazon SES Setup

1. Go to AWS Console → SES
2. Verify email address
3. Create IAM user with SES permissions
4. Generate access keys
5. Add to `.env`

## 🚀 Deployment

### Deploy to Railway/Render/Fly.io

1. Push code to GitHub
2. Connect to deployment platform
3. Add environment variables
4. Deploy

### Deploy to AWS/DigitalOcean

```bash
# Build and start
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start src/index.js --name docitup-api
pm2 save
pm2 startup
```

## 🛡️ Security Best Practices

- ✅ Passwords hashed with bcrypt
- ✅ JWT for stateless authentication
- ✅ CORS enabled
- ✅ Environment variables for secrets
- ✅ Input validation
- ✅ MongoDB injection protection (Mongoose)
- ✅ Rate limiting recommended (add express-rate-limit)

## 📦 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── r2.js          # Cloudflare R2 config
│   │   └── ses.js         # Amazon SES config
│   ├── controllers/
│   │   ├── auth.js
│   │   ├── entries.js
│   │   ├── goals.js
│   │   ├── community.js
│   │   └── media.js
│   ├── db/
│   │   └── connection.js   # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Entry.js
│   │   └── Goal.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── entries.js
│   │   ├── goals.js
│   │   ├── community.js
│   │   └── media.js
│   ├── utils/
│   │   └── email.js        # Email utilities
│   └── index.js            # Main server file
├── .env.example
├── package.json
└── README.md
```

## 🐛 Troubleshooting

**MongoDB connection failed**:
- Check if MongoDB is running
- Verify connection string
- Check network/firewall settings

**File upload not working**:
- Verify R2 credentials
- Check bucket permissions
- Ensure file size within limits (50MB)

**Email not sending**:
- Verify SES email address
- Check SES sandbox mode (verify recipients)
- Review IAM permissions

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Support

For issues or questions, create an issue on GitHub or contact the team.

---

Built with ❤️ for the Docitup community

