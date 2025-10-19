# Deployment Guide

## Frontend Build Status

✅ **Frontend build completed successfully!**

The production build is located in `frontend/dist/`

### Build Output:
- `dist/index.html` - Main HTML file
- `dist/assets/index-*.js` - JavaScript bundle (~519 KB)
- `dist/assets/index-*.css` - CSS bundle (~97 KB)

## Deployment Options

### Option 1: Static Hosting (Recommended)

The frontend can be deployed to any static hosting service:

#### Netlify
1. Push code to GitHub/GitLab
2. Connect repository to Netlify
3. Build command: `cd app && npm install --legacy-peer-deps && npm run build`
4. Publish directory: `app/dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`

#### Vercel
1. Push code to GitHub/GitLab
2. Connect repository to Vercel
3. Root directory: `app`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`

#### GitHub Pages
1. Install `gh-pages`: `npm install --save-dev gh-pages`
2. Add to `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```
3. Run: `npm run deploy`

### Option 2: Traditional Web Server

1. Build the frontend: `cd app && npm run build`
2. Copy the `dist` folder contents to your web server (nginx, Apache, etc.)
3. Configure your server to serve `index.html` for all routes (SPA routing)

#### Nginx Configuration Example:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Backend Deployment

### Environment Variables Required:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://user:password@host:5432/docitup
OPENAI_API_KEY=your-openai-api-key
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Deployment Steps:
1. Build backend: `cd backend && npm run build`
2. Copy `backend` folder to server
3. Install dependencies: `npm install --production`
4. Run migrations: `npm run migrate`
5. Start server: `npm start`

### Using PM2 (Process Manager):
```bash
pm2 start dist/index.js --name docitup-backend
pm2 save
pm2 startup
```

## Production Checklist

### Frontend:
- [x] Build completed successfully
- [ ] Set `VITE_API_URL` environment variable
- [ ] Configure CORS on backend for production domain
- [ ] Test all routes work correctly
- [ ] Verify API connections

### Backend:
- [ ] Database configured and migrated
- [ ] Environment variables set
- [ ] JWT secret changed from default
- [ ] File upload directory has write permissions
- [ ] CORS configured for frontend domain
- [ ] HTTPS/SSL configured
- [ ] Process manager (PM2) configured
- [ ] Backups configured

## Quick Deploy Commands

### Build Frontend:
```bash
cd app
npm install --legacy-peer-deps
npm run build
```

### Build Backend:
```bash
cd backend
npm install
npm run build
```

### Test Production Build Locally:
```bash
cd app
npm run preview
# Open http://localhost:4173
```

## Notes

- The frontend is a Single Page Application (SPA) - ensure your server is configured for client-side routing
- Update `VITE_API_URL` in frontend `.env` or build environment to point to your backend API
- Backend must be accessible from the frontend domain (CORS configuration)
- File uploads directory must be accessible and have proper permissions
- Consider using a CDN for static assets in production

