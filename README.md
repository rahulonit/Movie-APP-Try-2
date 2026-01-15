# 🎬 OTT Streaming Platform - Complete Guide

A production-grade, Netflix-style OTT (Over-The-Top) streaming platform with mobile-first architecture, built with modern technologies for scalability and performance.

## 📁 Project Structure

```
Movie APP Try 2/
├── backend/                 # Node.js + Express + MongoDB backend
│   ├── src/
│   │   ├── config/         # Database, Cloudinary, Mux config
│   │   ├── models/         # Mongoose schemas
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── utils/          # Helper functions
│   │   └── server.ts       # Main server file
│   ├── package.json
│   └── tsconfig.json
│
└── mobile/                  # React Native (Expo) mobile app
    ├── src/
    │   ├── services/       # API service layer
    │   ├── store/          # Redux state management
    │   └── screens/        # App screens
    ├── App.tsx
    ├── package.json
    └── app.json
```

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Required environment variables:**
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_REFRESH_SECRET=your_secure_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
```

5. **Start development server:**
```bash
npm run dev
```

Server will run at `http://localhost:5000`

### Mobile App Setup

1. **Navigate to mobile:**
```bash
cd mobile
```

2. **Install dependencies:**
```bash
npm install
```

3. **Update API URL:**
Edit `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_IP:5000/api';
```

4. **Start Expo:**
```bash
npm start
```

5. **Run on device:**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code for physical device

## 🧱 Technology Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **TypeScript** - Type safety
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **Cloudinary** - Image storage & CDN
- **Mux** - Video streaming & encoding
- **bcrypt** - Password hashing

### Mobile
- **React Native** (Expo) - Mobile framework
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Navigation** - Routing
- **expo-av** - Video player
- **Axios** - HTTP client

## 🎯 Core Features

### User Features
✅ Email/Password authentication  
✅ Multi-profile support (up to 5)  
✅ Kids profiles with content filtering  
✅ Subscription management (Free/Premium)  
✅ Watch history & resume playback  
✅ My List (Watchlist)  
✅ Global search with filters  
✅ Genre-based browsing  

### Content Features
✅ Movies & Series support  
✅ Seasons & Episodes structure  
✅ HLS video streaming (Mux)  
✅ CDN-optimized images (Cloudinary)  
✅ Maturity ratings (U/UA/A)  
✅ Premium content access control  
✅ View tracking & analytics  

### Admin Features
✅ Complete CRUD for movies & series  
✅ Image upload to Cloudinary  
✅ Video upload to Mux  
✅ User management  
✅ Subscription control  
✅ Analytics dashboard  
✅ Content publishing control  

## 🔐 Authentication Flow

1. User registers/logs in
2. Backend returns JWT access + refresh tokens
3. Mobile app stores tokens in AsyncStorage
4. User selects/creates profile
5. Profile ID sent with content requests
6. Tokens auto-refresh on expiry

## 📊 Database Schema

### User
```javascript
{
  email, passwordHash, role,
  subscription: { plan, status, expiresAt },
  profiles: [{
    name, avatar, isKids,
    watchHistory: [{ contentId, progress, duration }],
    myList: [contentId]
  }]
}
```

### Movie
```javascript
{
  title, description, genres, language,
  releaseYear, duration, rating,
  poster: { vertical, horizontal },
  muxPlaybackId, muxAssetId,
  maturityRating, isPremium, views
}
```

### Series
```javascript
{
  title, description, genres, language,
  poster: { vertical, horizontal },
  seasons: [{
    seasonNumber,
    episodes: [{
      episodeNumber, title, duration,
      muxPlaybackId, thumbnail, views
    }]
  }],
  maturityRating, isPremium, totalViews
}
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Content (Protected)
- `GET /api/home` - Home feed
- `GET /api/movies/:id` - Movie details
- `GET /api/series/:id` - Series details
- `GET /api/search` - Search content

### User Actions (Protected)
- `POST /api/profiles` - Create profile
- `POST /api/my-list/add` - Add to watchlist
- `POST /api/progress/update` - Update watch progress

### Admin (Protected + Admin Role)
- `POST /api/admin/movies` - Create movie
- `POST /api/admin/upload-image` - Upload image
- `GET /api/admin/analytics/dashboard` - Dashboard metrics
- `GET /api/admin/users` - List all users

## 🎥 Media Workflow

### Image Upload
1. Admin uploads image via API
2. Image sent to Cloudinary
3. Cloudinary returns URL
4. URL stored in MongoDB
5. Images served via Cloudinary CDN

### Video Upload
1. Admin requests Mux upload URL
2. Video uploaded directly to Mux
3. Mux encodes to HLS
4. Mux returns playback ID
5. Playback ID stored in MongoDB
6. Video streams via Mux CDN

## 🔒 Security Best Practices

✅ Password hashing with bcrypt (12 rounds)  
✅ JWT with short expiry + refresh tokens  
✅ Role-based access control  
✅ Rate limiting on API routes  
✅ Helmet.js security headers  
✅ CORS configuration  
✅ Input validation  
✅ Premium content checks  
✅ MongoDB injection prevention  

## 📱 Mobile App Screens

### Auth Flow
- Login Screen
- Register Screen

### Main App
- Profile Selection
- Home (Tab)
- Search (Tab)
- My List (Tab)
- Account (Tab)

### Content
- Movie Detail
- Series Detail
- Video Player

## 🚀 Deployment

### Backend
1. Build TypeScript:
```bash
npm run build
```

2. Deploy to:
- AWS EC2
- DigitalOcean Droplet
- Heroku
- Railway
- Render

### Mobile
1. Build production app:
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

2. Submit to stores:
- Apple App Store
- Google Play Store

## 🧪 Testing

### Backend
```bash
# Run tests
npm test

# API testing with Postman
# Import collection from /docs/postman
```

### Mobile
```bash
# Run on simulator/emulator
npm start

# Test on physical device
# Scan QR code from Expo
```

## 📈 Monitoring & Analytics

### Backend Metrics
- Total users
- Active subscriptions
- Content views
- Watch time
- Daily active users

### Content Analytics
- Top movies/series
- Genre distribution
- Completion rates
- Drop-off points

## 🔧 Configuration

### Backend Environment Variables
See `backend/.env.example` for all required variables

### Mobile Configuration
Update `mobile/src/services/api.ts` for API URL

### Cloud Services
- **MongoDB Atlas** - Database hosting
- **Cloudinary** - Image CDN
- **Mux** - Video streaming

## 🐛 Common Issues

### Backend won't start
- Check MongoDB connection string
- Verify all environment variables
- Ensure port 5000 is available

### Mobile can't connect
- Update API_BASE_URL with correct IP
- Check firewall settings
- Ensure backend is running

### Videos won't play
- Verify Mux credentials
- Check playback ID is valid
- Ensure internet connection

## 📚 Additional Resources

- [Backend API Documentation](backend/README.md)
- [Mobile App Guide](mobile/README.md)
- [MongoDB Docs](https://docs.mongodb.com)
- [Mux Docs](https://docs.mux.com)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Expo Docs](https://docs.expo.dev)

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 🙏 Credits

Built with modern best practices for production-ready OTT streaming platforms.

---

**Ready to launch your own streaming platform!** 🎉

For support or questions, check the individual README files in backend and mobile directories.
