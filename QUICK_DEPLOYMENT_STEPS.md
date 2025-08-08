# DentOS Quick Deployment Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- A server or hosting platform (e.g., AWS, Heroku, DigitalOcean, Vercel, Netlify)

## Step 1: Fix the Authorization Issue

The "Not authorised to access this route" error occurs because your current user doesn't have the required role (admin or manager) to create clinics. Here's how to fix it:

1. **Login with admin credentials**:
   ```
   Email: admin@smilecare.com
   Password: Demo@2025
   ```

2. If you don't have an admin account, create one by registering with the admin role:
   ```
   curl -X POST http://localhost:5000/api/auth/register \
   -H "Content-Type: application/json" \
   -d '{"name":"Admin User","email":"admin@smilecare.com","password":"Demo@2025","role":"admin"}'
   ```

## Step 2: Prepare for Deployment

### Backend Preparation

1. Create a `.env` file in the backend directory with production settings:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb://your-mongodb-connection-string
   JWT_SECRET=your-secure-jwt-secret
   JWT_EXPIRE=30d
   ```

2. Install production dependencies:
   ```
   cd backend
   npm install --production
   ```

### Frontend Preparation

1. Update the `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=https://your-backend-api-url/api
   ```

2. Build the production version:
   ```
   cd frontend
   npm run build
   ```

## Step 3: Deploy the Backend

### Option 1: Traditional Server

1. Install PM2:
   ```
   npm install -g pm2
   ```

2. Start the server with PM2:
   ```
   cd backend
   pm2 start server.js --name dentos-backend
   pm2 startup
   pm2 save
   ```

### Option 2: Heroku

1. Create a new Heroku app:
   ```
   heroku create dentos-backend
   ```

2. Add a Procfile in the backend directory:
   ```
   web: node server.js
   ```

3. Set environment variables:
   ```
   heroku config:set NODE_ENV=production JWT_SECRET=your-secret ...
   ```

4. Deploy to Heroku:
   ```
   git subtree push --prefix backend heroku main
   ```

## Step 4: Deploy the Frontend

### Option 1: Traditional Web Hosting

1. Upload the contents of the `build` directory to your web server
2. Configure your web server (Apache/Nginx) to serve the static files
3. Set up URL rewriting to handle React Router paths

### Option 2: Netlify

1. Install Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

2. Deploy the build folder:
   ```
   cd frontend
   netlify deploy --prod --dir=build
   ```

### Option 3: Vercel

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Deploy the project:
   ```
   cd frontend
   vercel --prod
   ```

## Step 5: Verify Deployment

1. Access your deployed frontend application
2. Login with admin credentials
3. Verify that you can create, update, and delete clinics
4. Test other functionality to ensure everything is working correctly

## Troubleshooting

### CORS Issues

If you encounter CORS errors, update the backend's `server.js` to allow your frontend domain:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

### Authentication Issues

If you encounter JWT token issues:
1. Ensure the JWT_SECRET is properly set in your backend environment
2. Verify that the frontend is using the correct API URL
3. Check that the token is being properly stored and sent with requests

### Database Connection Issues

If MongoDB connection fails:
1. Verify your MongoDB connection string
2. Ensure your IP address is whitelisted in MongoDB Atlas
3. Check that your database user has the correct permissions