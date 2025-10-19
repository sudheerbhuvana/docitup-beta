# Docitup - Quick Start Guide

Get your Docitup application up and running in minutes!

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB (local or Atlas)
- Git

## 🚀 Quick Setup (5 minutes)

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd docitup-main

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../app
npm install
```

### 2. Configure Backend

```bash
cd backend

# Create .env file
cp .env.example .env

# Edit .env with your settings (minimum required):
```

**Minimum `.env` configuration:**

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/docitup
JWT_SECRET=your-secret-key-change-this
```

> **Note**: For full features (file uploads, emails), configure R2 and SES. See [Backend README](./backend/README.md) for details.

### 3. Configure Frontend

```bash
cd ../app

# Create .env file
cp .env.example .env

# The default settings should work:
```

**Frontend `.env`:**

```env
VITE_API_URL=http://localhost:5001/api
```

### 4. Start MongoDB

**Option A: Local MongoDB**

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**

1. Create free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`

### 5. Run the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5001
```

**Terminal 2 - Frontend:**

```bash
cd app
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 6. Open Your Browser

Navigate to: **http://localhost:5173**

🎉 **You're all set!** Create an account and start journaling!

---

## 🧪 Quick Test

1. Open http://localhost:5173
2. Click "Get Started Free"
3. Fill in your details:
   - Email: test@example.com
   - Password: password123
   - First Name: John
   - Last Name: Doe
4. Click "Sign up →"
5. You'll be redirected to the dashboard!

---

## 🔧 Troubleshooting

### Backend won't start

**MongoDB connection failed?**

```bash
# Check if MongoDB is running
mongosh

# If not installed locally, use MongoDB Atlas
```

**Port 5001 already in use?**

```bash
# Change port in backend/.env
PORT=5002

# Update frontend API URL in app/.env
VITE_API_URL=http://localhost:5002/api
```

### Frontend can't connect to backend

1. Check backend is running on port 5001
2. Check `app/.env` has correct `VITE_API_URL`
3. Check browser console for errors
4. Try clearing browser cache

### Registration/Login not working

1. Check MongoDB is connected (see backend console)
2. Check browser network tab for API errors
3. Verify JWT_SECRET is set in `backend/.env`

---

## 📁 Project Structure

```
docitup-main/
├── app/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # UI components
│   │   ├── lib/          # API & utilities
│   │   └── contexts/     # React contexts
│   ├── .env              # Frontend config
│   └── package.json
│
├── backend/               # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # MongoDB models
│   │   ├── middleware/   # Auth, error handling
│   │   └── config/       # R2, SES config
│   ├── .env              # Backend config
│   └── package.json
│
└── README.md
```

---

## 🎯 Next Steps

### Essential Features (Already Working)

- ✅ User registration & login
- ✅ Journal entries (create, read, update, delete)
- ✅ Goals tracking
- ✅ Community features
- ✅ Modern UI with Aceternity components

### Optional: Enable File Uploads

To upload images/videos to journal entries:

1. **Create Cloudflare R2 Account**
   - Sign up at [cloudflare.com](https://www.cloudflare.com/)
   - Create R2 bucket: `docitup-media`
   - Generate API tokens
   - Add to `backend/.env`:

```env
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=docitup-media
R2_PUBLIC_URL=https://your-bucket.r2.cloudflarestorage.com
```

2. Restart backend

### Optional: Enable Email Notifications

1. **Set up Amazon SES**
   - Go to AWS Console → SES
   - Verify your email address
   - Create IAM user with SES permissions
   - Add to `backend/.env`:

```env
AWS_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your-key
AWS_SES_SECRET_ACCESS_KEY=your-secret
FROM_EMAIL=noreply@yourdomain.com
```

2. Restart backend

---

## 📚 Documentation

- [Full README](./README.md) - Complete project overview
- [Backend API Docs](./backend/README.md) - API endpoints & setup
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to production
- [Setup Guide](./SETUP.md) - Detailed configuration

---

## 🆘 Need Help?

### Common Issues

**"Cannot GET /api/auth/login"**
- Backend is not running or wrong port

**"Network Error"**
- Check CORS settings
- Verify API_URL in frontend .env
- Check browser console

**"Invalid token"**
- Clear localStorage
- Re-login
- Check JWT_SECRET is set

### Get Support

- 📖 Read the [full documentation](./README.md)
- 🐛 Check [GitHub Issues](https://github.com/yourusername/docitup/issues)
- 💬 Contact the team

---

## ⚡ Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Vite automatically reloads on file changes
- Backend: Nodemon restarts server on file changes

### Demo Mode

Don't have backend running? The frontend has a demo mode:
- Go to any auth page
- Data is mocked locally
- Perfect for UI development

### API Testing

Test API endpoints directly:

```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Create entry (replace TOKEN with your JWT)
curl -X POST http://localhost:5001/api/entries \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Hello world"}'
```

---

## 🎨 Customization

### Change Colors

Edit `app/src/index.css` - update CSS variables for theming

### Add Components

Use Aceternity UI components from `app/src/components/ui/`

### Modify API

Update `backend/src/routes/` and `backend/src/controllers/`

---

**Built with ❤️ for privacy-first journaling**

Happy coding! 🚀

