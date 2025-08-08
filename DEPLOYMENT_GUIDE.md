# DentOS - Deployment Guide

## Introduction

This guide provides step-by-step instructions for deploying the DentOS application in a production environment. It covers setting up the backend server, frontend application, database, and creating a demonstration account for testing purposes.

## Prerequisites

Before deploying, ensure you have the following:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- A server or hosting platform (e.g., AWS, Heroku, DigitalOcean)
- Domain name (optional but recommended for production)

## Backend Deployment

### Step 1: Prepare the Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install production dependencies:
   ```
   npm install --production
   ```

3. Create a `.env` file with production settings:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb://your-mongodb-connection-string
   JWT_SECRET=your-secure-jwt-secret
   JWT_EXPIRE=30d
   EMAIL_SERVICE=your-email-service
   EMAIL_USERNAME=your-email-username
   EMAIL_PASSWORD=your-email-password
   EMAIL_FROM=your-email-address
   SMS_API_KEY=your-sms-api-key
   WHATSAPP_API_KEY=your-whatsapp-api-key
   DOCUMENT_UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf,application/dicom
   ```

   Replace the placeholder values with your actual production credentials.

### Step 2: Set Up MongoDB

1. For cloud-hosted MongoDB (recommended for production):
   - Create an account on MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
   - Set up a new cluster
   - Create a database user with appropriate permissions
   - Get your connection string and update the `MONGODB_URI` in your `.env` file

2. For self-hosted MongoDB:
   - Install MongoDB on your server
   - Configure security settings and create a database user
   - Update the `MONGODB_URI` in your `.env` file

### Step 3: Deploy the Backend

1. For a traditional server:
   - Install PM2 for process management:
     ```
     npm install -g pm2
     ```
   - Start the server with PM2:
     ```
     pm2 start server.js --name dentos-backend
     ```
   - Set up PM2 to start on system boot:
     ```
     pm2 startup
     pm2 save
     ```

2. For Heroku deployment:
   - Install Heroku CLI
   - Create a new Heroku app:
     ```
     heroku create dentos-backend
     ```
   - Add a Procfile in the backend directory with:
     ```
     web: node server.js
     ```
   - Set environment variables in Heroku:
     ```
     heroku config:set NODE_ENV=production JWT_SECRET=your-secret ...
     ```
   - Deploy to Heroku:
     ```
     git subtree push --prefix backend heroku main
     ```

## Frontend Deployment

### Step 1: Prepare the Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Update the API URL in `.env` or `.env.production`:
   ```
   REACT_APP_API_URL=https://your-backend-api-url
   ```

3. Build the production version:
   ```
   npm run build
   ```
   This creates optimized files in the `build` directory.

### Step 2: Deploy the Frontend

1. For traditional web hosting:
   - Upload the contents of the `build` directory to your web server
   - Configure your web server (Apache/Nginx) to serve the static files
   - Set up URL rewriting to handle React Router paths

2. For Netlify deployment:
   - Install Netlify CLI
   - Deploy the build folder:
     ```
     netlify deploy --prod --dir=build
     ```

3. For Vercel deployment:
   - Install Vercel CLI
   - Deploy the project:
     ```
     vercel --prod
     ```

## Setting Up a Demonstration Account

### Creating Admin Account

1. Access your MongoDB database using MongoDB Compass or the MongoDB Atlas interface

2. Alternatively, you can use the registration endpoint with the following curl command:
   ```
   curl -X POST https://your-backend-url/api/auth/register \
   -H "Content-Type: application/json" \
   -d '{"name":"Admin User","email":"admin@dentos.com","password":"Demo@123","role":"admin"}'
   ```

3. Document the demo credentials in a secure location:
   ```
   Demo Admin Account
   Email: admin@dentos.com
   Password: Demo@123
   ```

### Creating Additional Test Accounts

1. Create a dentist account:
   ```
   curl -X POST https://your-backend-url/api/auth/register \
   -H "Content-Type: application/json" \
   -d '{"name":"Dr. Sharma","email":"dentist@dentos.com","password":"Demo@123","role":"dentist"}'
   ```

2. Create a receptionist account:
   ```
   curl -X POST https://your-backend-url/api/auth/register \
   -H "Content-Type: application/json" \
   -d '{"name":"Receptionist","email":"reception@dentos.com","password":"Demo@123","role":"receptionist"}'
   ```

## Enabling Self-Registration for Dental Practitioners

### Step 1: Update the Auth Controller

The backend already includes self-registration functionality in the auth controller. Ensure the registration endpoint is properly configured to allow new users to register with the "dentist" role by default.

### Step 2: Configure Email Verification

1. Ensure the email service is properly configured in your `.env` file
2. Test the email verification flow to confirm new registrations receive verification emails

### Step 3: Set Up Admin Approval (Optional)

If you want to require admin approval for new registrations:

1. Update the User model to include an "approved" field defaulting to false
2. Modify the auth middleware to check for the approved status
3. Create an admin interface to approve new registrations

## Setting Up Document Management

### Configure Document Storage

1. Create a directory for document uploads:
   ```
   mkdir -p /path/to/your/uploads
   ```

2. Set appropriate permissions:
   ```
   chmod 755 /path/to/your/uploads
   ```

3. Update the `DOCUMENT_UPLOAD_PATH` in your `.env` file to point to this directory

4. For production, consider using cloud storage solutions:
   - AWS S3
   - Google Cloud Storage
   - Azure Blob Storage

### Document Backup Strategy

1. Set up regular backups of the document directory
2. For cloud storage, enable versioning and lifecycle policies
3. Implement a retention policy based on regulatory requirements

## Setting Up Communication Services

### Email Configuration

1. Set up an account with an email service provider (SendGrid, Mailgun, etc.)
2. Obtain API credentials and update the `.env` file
3. Test the email service with a test message

### SMS Configuration

1. Set up an account with an SMS service provider (Twilio, Nexmo, etc.)
2. Obtain API credentials and update the `.env` file
3. Test the SMS service with a test message

### WhatsApp Configuration

1. Set up a WhatsApp Business API account
2. Complete the verification process
3. Obtain API credentials and update the `.env` file
4. Test the WhatsApp service with a test message

## Security Considerations

1. **HTTPS**: Ensure your application is served over HTTPS
   - Obtain an SSL certificate (Let's Encrypt provides free certificates)
   - Configure your web server to use HTTPS

2. **Environment Variables**: Never commit sensitive information to your repository
   - Use environment variables for all secrets and credentials
   - Consider using a secrets management service for production
   
3. **Document Security**:
   - Implement proper access controls for patient documents
   - Enable encryption for sensitive files
   - Set up audit logging for document access

3. **Regular Updates**: Keep all dependencies updated
   ```
   npm audit
   npm update
   ```

4. **Database Backups**: Set up regular automated backups of your MongoDB database

## Monitoring and Maintenance

1. **Server Monitoring**:
   - Set up monitoring tools like PM2 Monitoring, New Relic, or Datadog
   - Configure alerts for server issues

2. **Error Logging**:
   - Implement a logging solution like Winston or Bunyan
   - Consider using a service like Sentry for error tracking

3. **Performance Optimization**:
   - Implement caching strategies for frequently accessed data
   - Set up database indexing for common queries
   - Use a CDN for static assets

## Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Check network connectivity
   - Verify MongoDB connection string
   - Ensure firewall rules allow necessary connections

2. **Authentication Issues**:
   - Verify JWT secret is correctly set
   - Check token expiration settings
   - Ensure user credentials are correct

3. **File Upload Problems**:
   - Check directory permissions
   - Verify file size limits
   - Ensure proper MIME type handling

## Conclusion

Following this deployment guide should result in a fully functional DentOS system in a production environment. Remember to regularly back up your data and keep the system updated with security patches.

For additional support or questions, refer to the technical documentation or contact the development team.