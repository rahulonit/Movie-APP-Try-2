# 🚀 Backend Deployment & API Configuration Fix

## Issue Identified

Your mobile app is trying to connect to a backend API, but receiving:
```
Status: 404 Not Found
Error: DEPLOYMENT_NOT_FOUND
URL: https://movie-app-backend-ecru.vercel.app/api/auth/login
```

This means the Vercel deployment for the backend isn't accessible.

---

## ✅ Fix Steps

### Step 1: Verify Backend Deployment on Vercel

**Option A: Re-deploy to Vercel**
```bash
# Navigate to backend directory
cd backend

# Login to Vercel if not already logged in
npm i -g vercel
vercel login

# Deploy
vercel --prod

# This will give you the actual deployment URL
# It might be different from 'movie-app-backend-eta'
```

**Option B: Check Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Look for your backend project
3. Check the "Deployments" tab
4. Verify the latest deployment is successful (not in "Failed" state)
5. Copy the actual deployment URL from the domain settings

### Step 2: Update Mobile API Configuration

Once you have the correct Vercel URL, add it to your `.env` file or `app.json`:

**Option A: Using Environment Variables (Recommended)**

Create `.env.local` in mobile folder:
```
EXPO_PUBLIC_API_BASE_URL=https://your-actual-backend-url.vercel.app
```

Then update `eas.json` (or create if missing):
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://your-actual-backend-url.vercel.app"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "http://localhost:5002"
      }
    }
  }
}
```

**Option B: Using app.json**

Update `mobile/app.json`:
```json
{
  "expo": {
    "name": "ott-streaming-mobile",
    "extra": {
      "API_BASE_URL": "https://your-actual-backend-url.vercel.app"
    }
  }
}
```

### Step 3: Enable CORS in Backend

Your backend needs CORS enabled for requests from the mobile app. Update `backend/src/server.ts`:

```typescript
import cors from 'cors';

const app = express();

// Enable CORS with specific origins
app.use(cors({
  origin: [
    'http://localhost:8081',      // Expo dev
    'http://localhost:3000',       // Web
    'http://localhost:19000',      // Expo tunnel
    'http://localhost:19001',      // Expo tunnel
    /^https:\/\/.*\.vercel\.app$/, // Allow all Vercel deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle OPTIONS preflight
app.options('*', cors());
```

Install cors if not already installed:
```bash
cd backend
npm install cors
npm install --save-dev @types/cors
```

### Step 4: Update Backend package.json

Ensure your backend is properly configured for Vercel:

```json
{
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/src/server.js",
    "dev": "ts-node src/server.ts",
    "vercel-build": "tsc"
  }
}
```

---

## 📋 Testing Checklist

- [ ] Backend is deployed on Vercel (check deployment status)
- [ ] Vercel deployment URL is accessible (test in browser)
- [ ] CORS is enabled in backend server
- [ ] Mobile app environment variables are set correctly
- [ ] API base URL is updated to Vercel URL
- [ ] Test login request works (no more 404 errors)

---

## 🔍 Current API Configuration

Your `mobile/src/services/api.ts` currently:

1. **Checks for environment variables:**
   - `EXPO_PUBLIC_API_BASE_URL`
   - `EXPO_PUBLIC_API_HOST`

2. **Falls back to localhost:**
   - Android: `10.0.2.2:5002`
   - iOS: `localhost:5002`
   - Web: `localhost:5002`

3. **Auto-detects development environment:**
   - Uses packager host when running with Expo

---

## 🚀 Recommended Setup

For production deployment:

1. **Backend (Vercel):**
   ```
   https://movie-app-backend.vercel.app
   ```

2. **Mobile (Expo/EAS):**
   - Development: `http://localhost:5002` (or tunnel URL)
   - Production: `https://movie-app-backend.vercel.app`

3. **Environment Configuration:**
   - Store API URL in `.env.local` (git ignored)
   - Use Vercel Environment Variables dashboard
   - Use EAS Secrets for sensitive data

---

## ⚠️ Common Issues & Solutions

### Issue: "DEPLOYMENT_NOT_FOUND"
**Cause:** Vercel deployment doesn't exist or failed
**Solution:** 
- Run `vercel --prod` in backend folder
- Check Vercel dashboard for build errors
- Verify all environment variables are set

### Issue: CORS errors
**Cause:** Backend doesn't allow requests from mobile origin
**Solution:**
- Add `cors` middleware to backend
- Include mobile app origin in CORS whitelist
- Test with OPTIONS preflight requests

### Issue: Timeout errors
**Cause:** Network connectivity or slow API response
**Solution:**
- Check API response time in browser
- Increase timeout in api.ts if needed
- Check database connection on backend

### Issue: 401/403 Authentication errors
**Cause:** Token missing or invalid
**Solution:**
- Check tokenService.ts for token storage
- Verify token is sent in Authorization header
- Check token expiration logic

---

## 📝 Next Steps

1. **Immediate:**
   - [ ] Get actual Vercel backend URL
   - [ ] Update `.env.local` with correct URL
   - [ ] Restart Expo dev server

2. **Backend:**
   - [ ] Install and configure CORS
   - [ ] Re-deploy to Vercel with updated code
   - [ ] Verify deployment is successful

3. **Testing:**
   - [ ] Test login endpoint with correct URL
   - [ ] Verify CORS preflight succeeds
   - [ ] Check console logs for any errors

---

## 💡 Quick Command Reference

```bash
# Backend deployment
cd backend
npm i -g vercel
vercel login
vercel --prod

# Check Vercel logs
vercel logs -f

# Local backend testing
npm run dev

# Mobile with custom API
EXPO_PUBLIC_API_BASE_URL=https://your-url.vercel.app npm start
```

---

Once deployed, update your API configuration and the 404 error should resolve! 🚀
