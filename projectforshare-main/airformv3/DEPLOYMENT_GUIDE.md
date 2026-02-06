# 🚀 Artistic Forms - Complete Deployment Guide

## 📋 Overview
This guide will help you deploy your Artistic Forms application to production. The app consists of:
- **Frontend**: React.js application
- **Backend**: Node.js/Express API server
- **Database**: MongoDB
- **File Storage**: For form media uploads

## 🛠️ Deployment Options

### Option 1: Vercel + Railway (Recommended - Easiest)
**Frontend on Vercel, Backend on Railway**

### Option 2: Netlify + Heroku
**Frontend on Netlify, Backend on Heroku**

### Option 3: DigitalOcean/AWS (Advanced)
**Full control with VPS or cloud services**

---

## 🚀 Option 1: Vercel + Railway Deployment

### Step 1: Prepare Your Code

1. **Update Environment Variables**
```bash
# Create production .env files
cp .env .env.production
```

2. **Update Frontend Environment Variables**
```env
# aiformv2/.env.production
VITE_API_URL=https://your-backend-url.railway.app/api
VITE_APP_URL=https://your-app.vercel.app
```

3. **Update Backend Environment Variables**
```env
# aiformv2/server/.env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/artisticforms
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=https://your-app.vercel.app
GEMINI_API_KEY=your-gemini-api-key
```

### Step 2: Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create free account and cluster

2. **Configure Database**
   - Create database: `artisticforms`
   - Create user with read/write permissions
   - Whitelist IP addresses (0.0.0.0/0 for production)
   - Get connection string

### Step 3: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub account

2. **Deploy Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Navigate to server directory
   cd aiformv2/server
   
   # Initialize Railway project
   railway init
   
   # Add environment variables
   railway variables set NODE_ENV=production
   railway variables set MONGODB_URI="your-mongodb-connection-string"
   railway variables set JWT_SECRET="your-jwt-secret"
   railway variables set CORS_ORIGIN="https://your-app.vercel.app"
   
   # Deploy
   railway up
   ```

3. **Configure Railway Settings**
   - Set start command: `npm start`
   - Set build command: `npm install`
   - Enable auto-deploy from GitHub

### Step 4: Deploy Frontend to Vercel

1. **Prepare Frontend**
   ```bash
   # Navigate to frontend directory
   cd aiformv2
   
   # Update API URL in utils/auth.js and formApi.js
   # Replace localhost:5000 with your Railway backend URL
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   
   # Follow prompts:
   # - Link to existing project or create new
   # - Set build command: npm run build
   # - Set output directory: dist
   ```

3. **Configure Environment Variables in Vercel**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-backend.railway.app/api`

### Step 5: Configure Custom Domain (Optional)

1. **Add Custom Domain to Vercel**
   - Go to Project Settings → Domains
   - Add your domain (e.g., artisticforms.com)
   - Update DNS records as instructed

2. **Update CORS Settings**
   - Update `CORS_ORIGIN` in Railway to your custom domain

---

## 🚀 Option 2: Netlify + Heroku Deployment

### Step 1: Deploy Backend to Heroku

1. **Create Heroku App**
   ```bash
   # Install Heroku CLI
   # Create Heroku app
   heroku create your-app-name-api
   
   # Navigate to server directory
   cd aiformv2/server
   
   # Initialize git if not already
   git init
   git add .
   git commit -m "Initial commit"
   
   # Add Heroku remote
   heroku git:remote -a your-app-name-api
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="your-mongodb-connection-string"
   heroku config:set JWT_SECRET="your-jwt-secret"
   heroku config:set CORS_ORIGIN="https://your-app.netlify.app"
   
   # Deploy
   git push heroku main
   ```

2. **Create Procfile**
   ```bash
   # aiformv2/server/Procfile
   web: npm start
   ```

### Step 2: Deploy Frontend to Netlify

1. **Build Settings**
   ```bash
   # Create netlify.toml
   # aiformv2/netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [build.environment]
     VITE_API_URL = "https://your-app-name-api.herokuapp.com/api"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   - Connect GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Deploy

---

## 🚀 Option 3: DigitalOcean/AWS Deployment

### DigitalOcean Droplet Setup

1. **Create Droplet**
   - Ubuntu 22.04 LTS
   - At least 2GB RAM
   - Enable monitoring and backups

2. **Server Setup**
   ```bash
   # Connect to server
   ssh root@your-server-ip
   
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs
   
   # Install PM2
   npm install -g pm2
   
   # Install Nginx
   apt install nginx -y
   
   # Install certbot for SSL
   apt install certbot python3-certbot-nginx -y
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/artistic-forms.git
   cd artistic-forms/aiformv2
   
   # Install dependencies
   npm install
   cd server && npm install
   
   # Build frontend
   cd ../
   npm run build
   
   # Start backend with PM2
   cd server
   pm2 start npm --name "artistic-forms-api" -- start
   pm2 startup
   pm2 save
   ```

4. **Configure Nginx**
   ```nginx
   # /etc/nginx/sites-available/artistic-forms
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
   
       # Frontend
       location / {
           root /path/to/artistic-forms/aiformv2/dist;
           try_files $uri $uri/ /index.html;
       }
   
       # API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable SSL**
   ```bash
   # Enable site
   ln -s /etc/nginx/sites-available/artistic-forms /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   
   # Get SSL certificate
   certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

---

## 🔧 Production Configuration

### 1. Update API URLs

**Frontend (aiformv2/src/utils/auth.js)**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.com/api';
```

**Frontend (aiformv2/src/utils/formApi.js)**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.com/api';
```

### 2. Environment Variables

**Backend (.env)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/artisticforms
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
CORS_ORIGIN=https://your-frontend-domain.com
GEMINI_API_KEY=your-gemini-api-key
```

**Frontend (.env)**
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_URL=https://your-frontend-domain.com
```

### 3. Security Enhancements

**Add to server/index.js**
```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);
```

---

## 📊 Monitoring & Maintenance

### 1. Health Checks
```javascript
// Add to server/routes/index.js
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 2. Logging
```bash
# Install winston for logging
npm install winston

# Add to server/utils/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export default logger;
```

### 3. Database Backups
```bash
# MongoDB Atlas automatic backups (recommended)
# Or manual backup script
mongodump --uri="your-mongodb-connection-string" --out=/backup/$(date +%Y%m%d)
```

---

## 🔍 Testing Production

### 1. Test Checklist
- [ ] User registration/login works
- [ ] Form creation works
- [ ] Form sharing works with new URLs
- [ ] Form submissions work
- [ ] Dashboard displays correctly
- [ ] File uploads work (if implemented)
- [ ] Email notifications work (if implemented)
- [ ] Mobile responsiveness
- [ ] SSL certificate is valid
- [ ] All API endpoints respond correctly

### 2. Performance Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create test script (artillery-test.yml)
config:
  target: 'https://your-api-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "API Health Check"
    requests:
      - get:
          url: "/api/health"
```

---

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ORIGIN environment variable
   - Ensure frontend and backend URLs match

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for environment variable issues

4. **Custom URLs Not Working**
   - Ensure database migration ran successfully
   - Check form model has customUrl field
   - Verify routing is set up correctly

### Logs and Debugging
```bash
# Railway logs
railway logs

# Heroku logs
heroku logs --tail

# PM2 logs (DigitalOcean)
pm2 logs

# Nginx logs
tail -f /var/log/nginx/error.log
```

---

## 📈 Scaling Considerations

### 1. Database Optimization
- Add indexes for frequently queried fields
- Implement database connection pooling
- Consider read replicas for high traffic

### 2. CDN Setup
- Use Cloudflare or AWS CloudFront
- Optimize images and static assets
- Enable gzip compression

### 3. Caching
- Implement Redis for session storage
- Add API response caching
- Use browser caching headers

---

## 🎯 Final Steps

1. **Domain Setup**
   - Purchase domain from Namecheap, GoDaddy, etc.
   - Configure DNS records
   - Set up SSL certificates

2. **Analytics**
   - Add Google Analytics
   - Set up error tracking (Sentry)
   - Monitor performance (New Relic, DataDog)

3. **Backup Strategy**
   - Database backups
   - Code repository backups
   - Environment variable backups

4. **Documentation**
   - API documentation
   - User guides
   - Admin documentation

---

## 💰 Cost Estimates

### Free Tier (Development/Small Scale)
- **Vercel**: Free (hobby plan)
- **Railway**: $5/month (starter plan)
- **MongoDB Atlas**: Free (512MB)
- **Total**: ~$5/month

### Production Scale
- **Vercel Pro**: $20/month
- **Railway Pro**: $20/month
- **MongoDB Atlas**: $9/month (2GB)
- **Domain**: $12/year
- **Total**: ~$50/month

### Enterprise Scale
- **Custom VPS**: $50-200/month
- **Managed Database**: $50-500/month
- **CDN**: $20-100/month
- **Monitoring**: $50-200/month
- **Total**: $170-1000/month

---

## 🎉 You're Ready to Deploy!

Choose the deployment option that best fits your needs and budget. The Vercel + Railway option is recommended for most users as it's simple, reliable, and cost-effective.

Need help? Check the troubleshooting section or create an issue in the repository!