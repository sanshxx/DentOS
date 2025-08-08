# DentOS Local Testing Guide

## 🧪 Testing Your Application Locally

This guide will help you test your DentOS application locally before deploying to production.

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

## 🚀 Step 1: Start the Backend Server

### 1.1 Navigate to Backend Directory
```bash
cd backend
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Start the Backend Server
```bash
npm run dev
```

The backend will start on `http://localhost:5000`

## 🎨 Step 2: Start the Frontend Application

### 2.1 Open a New Terminal
Keep the backend running and open a new terminal window.

### 2.2 Navigate to Frontend Directory
```bash
cd frontend
```

### 2.3 Install Dependencies
```bash
npm install
```

### 2.4 Create Local Environment File
Create a `.env` file in the frontend directory with:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 2.5 Start the Frontend Application
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## 🧪 Step 3: Test the Application

### 3.1 Test User Registration
1. Go to `http://localhost:3000`
2. Click "Register"
3. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 1234567890
   - Password: Test123!
   - Role: Receptionist
4. Click "Register"
5. Verify the user is created successfully

### 3.2 Test User Login
1. Login with the credentials you just created
2. Verify you can access the dashboard
3. Check that the JWT token is stored

### 3.3 Test Core Features

#### Patients
1. Go to "Patients" section
2. Click "Add Patient"
3. Fill in patient details
4. Save and verify the patient appears in the list
5. Test document upload functionality
6. Test theme switching (light/dark mode)

#### Appointments
1. Go to "Appointments" section
2. Click "Add Appointment"
3. Select a patient and set appointment details
4. Save and verify the appointment appears in the calendar

#### Billing
1. Go to "Billing" section
2. Click "Create Invoice"
3. Select a patient and add items
4. Generate the invoice

#### Inventory
1. Go to "Inventory" section
2. Add inventory items
3. Test stock management features

#### Notifications
1. Check the notification bell in the header
2. Verify notifications appear based on your role
3. Test notification filtering and display

#### Theme System
1. Go to Settings → System Settings
2. Toggle between light and dark themes
3. Verify all components adapt to theme changes
4. Check that theme preference is saved
2. Click "Add Item"
3. Fill in item details
4. Save and verify the item appears in the list

#### Dashboard
1. Check the dashboard for real data
2. Verify charts and statistics are populated

## 🔍 Step 4: Verify Database Operations

### 4.1 Check MongoDB Atlas
1. Log into MongoDB Atlas
2. Navigate to your database
3. Check that collections are being created:
   - users
   - patients
   - appointments
   - invoices
   - inventory
   - treatments
   - clinics

### 4.2 Verify Data Persistence
1. Create some test data
2. Refresh the application
3. Verify data persists across sessions

## 🐛 Step 5: Debugging

### Backend Issues
- Check terminal for error messages
- Verify MongoDB connection
- Check environment variables

### Frontend Issues
- Check browser console for errors
- Verify API calls are reaching the backend
- Check network tab for failed requests

### Common Issues
1. **CORS Errors**: Backend CORS is configured for localhost
2. **Database Connection**: Verify MongoDB URI is correct
3. **Port Conflicts**: Ensure ports 5000 and 3000 are available

## 📊 Step 6: Performance Testing

### Load Testing
1. Create multiple users
2. Add many patients and appointments
3. Test search and filtering
4. Verify pagination works

### Feature Testing
1. Test all CRUD operations
2. Verify form validations
3. Test error handling
4. Check responsive design

## ✅ Step 7: Production Readiness Checklist

- [ ] User registration works
- [ ] User login works
- [ ] All CRUD operations work
- [ ] Data persists in database
- [ ] Error handling works
- [ ] Form validations work
- [ ] Responsive design works
- [ ] No console errors
- [ ] API endpoints respond correctly

## 🚀 Step 8: Deploy to Production

Once local testing is complete:

1. **Backend Deployment**:
   - Push code to GitHub
   - Render will auto-deploy

2. **Frontend Deployment**:
   - Push code to GitHub
   - Vercel will auto-deploy

3. **Environment Variables**:
   - Set `REACT_APP_API_URL=https://dentos.onrender.com/api` in Vercel
   - Verify MongoDB connection in Render

## 🎯 Testing URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📞 Support

If you encounter issues:
1. Check the terminal output
2. Check browser console
3. Verify environment variables
4. Test API endpoints directly

Happy testing! 🎉 