# 🚀 AI Form Builder - Backend API

Express.js backend with Google OAuth authentication and MongoDB integration.

## 📁 Project Structure

```
server/
├── config/
│   ├── db.js          # MongoDB connection
│   └── passport.js    # Passport Google OAuth strategy
├── models/
│   └── User.js        # User model schema
├── routes/
│   ├── authRoutes.js  # Authentication routes
│   └── userRoutes.js  # User-related routes
└── server.js          # Main server file
```

## 🔧 Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:

```bash
# MongoDB (install MongoDB locally or use MongoDB Atlas)
MONGO_URI=mongodb://localhost:27017/aiformbuilder

# Session secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-here

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

PORT=5000
```

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`

### 3. MongoDB Setup
**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com
# Ubuntu: sudo apt install mongodb

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update MONGO_URI in .env

## 🚀 Running the Server

### Development Mode (with auto-restart)
```bash
npm run server:dev
```

### Production Mode
```bash
npm run server
```

## 📡 API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### User Routes
- `GET /user/dashboard` - Protected dashboard route

## 🔒 Authentication Flow

1. User clicks "Login with Google" on frontend
2. Redirects to `/auth/google`
3. Google OAuth flow completes
4. User redirected to frontend dashboard
5. Frontend can check auth status with `/auth/me`

## 🛠️ Technologies Used

- **Express.js** - Web framework
- **Passport.js** - Authentication middleware
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **express-session** - Session management
- **connect-mongo** - MongoDB session store
- **CORS** - Cross-origin resource sharing