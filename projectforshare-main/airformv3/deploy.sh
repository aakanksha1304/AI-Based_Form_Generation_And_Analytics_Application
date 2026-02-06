#!/bin/bash

# Artistic Forms Deployment Script
echo "🚀 Starting Artistic Forms Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the aiformv2 directory"
    exit 1
fi

# Function to deploy to Vercel + Railway
deploy_vercel_railway() {
    echo "📦 Deploying to Vercel + Railway..."
    
    # Deploy backend to Railway
    echo "🚂 Deploying backend to Railway..."
    cd server
    
    # Check if Railway is installed
    if ! command -v railway &> /dev/null; then
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Deploy to Railway
    railway login
    railway up
    
    cd ..
    
    # Deploy frontend to Vercel
    echo "▲ Deploying frontend to Vercel..."
    
    # Check if Vercel is installed
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    echo "✅ Deployment complete!"
    echo "🌐 Your app should be live at your Vercel URL"
}

# Function to deploy to Netlify + Heroku
deploy_netlify_heroku() {
    echo "📦 Deploying to Netlify + Heroku..."
    
    # Deploy backend to Heroku
    echo "🟣 Deploying backend to Heroku..."
    cd server
    
    # Check if Heroku is installed
    if ! command -v heroku &> /dev/null; then
        echo "❌ Please install Heroku CLI first: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Initialize git if needed
    if [ ! -d ".git" ]; then
        git init
        git add .
        git commit -m "Initial commit"
    fi
    
    # Create Heroku app (you'll need to change the name)
    read -p "Enter your Heroku app name: " heroku_app_name
    heroku create $heroku_app_name
    
    # Set environment variables (you'll need to update these)
    echo "Setting environment variables..."
    heroku config:set NODE_ENV=production
    read -p "Enter your MongoDB URI: " mongodb_uri
    heroku config:set MONGODB_URI="$mongodb_uri"
    read -p "Enter your JWT secret: " jwt_secret
    heroku config:set JWT_SECRET="$jwt_secret"
    read -p "Enter your frontend URL: " frontend_url
    heroku config:set CORS_ORIGIN="$frontend_url"
    
    # Deploy
    git push heroku main
    
    cd ..
    
    # Deploy frontend to Netlify
    echo "🟢 Deploying frontend to Netlify..."
    
    # Check if Netlify is installed
    if ! command -v netlify &> /dev/null; then
        echo "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Build and deploy
    npm run build
    netlify deploy --prod --dir=dist
    
    echo "✅ Deployment complete!"
}

# Main menu
echo "Choose your deployment option:"
echo "1) Vercel + Railway (Recommended)"
echo "2) Netlify + Heroku"
echo "3) Exit"

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        deploy_vercel_railway
        ;;
    2)
        deploy_netlify_heroku
        ;;
    3)
        echo "Deployment cancelled."
        exit 0
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo "🎉 Deployment script completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update your environment variables in the hosting platforms"
echo "2. Test your deployed application"
echo "3. Set up custom domain (optional)"
echo "4. Configure monitoring and backups"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"