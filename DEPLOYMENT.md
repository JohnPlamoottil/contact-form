# Deployment Guide

This project uses **GitHub Pages + Railway** for full-stack deployment.

## Frontend Deployment (GitHub Pages)

✅ **Already deployed to:** https://johnplamoottil.github.io/contact-form/

The frontend is automatically deployed to GitHub Pages when you push to the `gh-pages` branch.

## Backend Deployment (Railway)

### Step 1: Create a Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Create a new project

### Step 2: Create a Database
1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Copy the connection string (you'll need it)

### Step 3: Deploy Backend to Railway
1. Click "New" → "GitHub Repo"
2. Select your `contact-form` repository
3. Railway will auto-detect it's a Node.js app

### Step 4: Set Environment Variables
In Railway dashboard, go to Variables and add:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
NODE_ENV=production
```

### Step 5: Get Your Backend URL
After deployment, Railway will give you a URL like:
```
https://contact-form-prod-xxxx.up.railway.app
```

## Step 3: Update Frontend to Use Railway Backend

Update the API endpoints in your frontend files to point to Railway.

### In `index.html` (around line 180):
Replace:
```javascript
const response = await fetch('/api/portfolio');
```

With:
```javascript
const API_URL = 'https://your-railway-url.up.railway.app';
const response = await fetch(API_URL + '/api/portfolio');
```

### In `admin.html` (around line 220):
Replace:
```javascript
const response = await fetch('/api/admin/login', {
```

With:
```javascript
const API_URL = 'https://your-railway-url.up.railway.app';
const response = await fetch(API_URL + '/api/admin/login', {
```

## Complete API Endpoints to Update

Find and replace these in both `index.html` and `admin.html`:

**OLD:**
```
/api/admin/login → API_URL + /api/admin/login
/api/admin/upload → API_URL + /api/admin/upload
/api/portfolio → API_URL + /api/portfolio
/api/admin/portfolio/ → API_URL + /api/admin/portfolio/
/api/admin/logout → API_URL + /api/admin/logout
```

## Deployment Summary

| Component | Location | URL |
|-----------|----------|-----|
| Frontend (Portfolio) | GitHub Pages | https://johnplamoottil.github.io/contact-form/ |
| Backend (API) | Railway | https://your-railway-url.up.railway.app |
| Admin Panel | GitHub Pages | https://johnplamoottil.github.io/contact-form/admin.html |

## How It Works

1. User visits your portfolio on GitHub Pages
2. Frontend makes API calls to Railway backend
3. Photos/videos are uploaded to Railway server
4. Admin panel is also on GitHub Pages, but connects to Railway backend

## Troubleshooting

**Admin login not working?**
- Check Railway deployment shows "Running"
- Verify API_URL is correct in admin.html
- Check browser console for errors

**Portfolio not loading photos?**
- Verify Railway backend is running
- Check API_URL configuration
- Ensure uploads are stored on Railway

**Need to update credentials?**
- Change ADMIN_USERNAME and ADMIN_PASSWORD in Railway variables
- Restart the deployment

## Free Tier Limits

Railway free tier includes:
- 5 GB storage
- 100 GB bandwidth/month
- PostgreSQL database

This is enough for a real estate portfolio!
