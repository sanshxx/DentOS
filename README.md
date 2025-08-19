# DentOS - Multi-Tenant Dental Practice Management System

A comprehensive, multi-tenant dental practice management system designed for Indian dental practitioners and clinic chains. DentOS provides complete data isolation between organizations while offering powerful collaboration features within each organization.

## 🏢 Multi-Tenant Architecture

**Complete Data Isolation**: Each dental practice/organization has completely isolated data
- **Organization-Level Security**: Patients, appointments, treatments, and all data are organization-specific
- **User Collaboration**: Users within the same organization share data with role-based access control
- **Scalable Design**: Support for unlimited organizations on a single platform

## 🔐 Role-Based Access Control (RBAC)

Five distinct user roles with varying access levels:
- **👑 Admin**: Full system access including financial data and user management
- **👨‍💼 Manager**: Business operations access including revenue and reports
- **🦷 Dentist**: Clinical data access (patients, treatments, appointments)
- **📞 Receptionist**: Front desk operations (appointments, patient check-in)
- **🤝 Assistant**: Limited clinical support access

## ✨ Core Features

### 👥 **Patient Management**
- Comprehensive patient records with medical history
- Organization-specific patient data with unique IDs
- Emergency contact management and treatment tracking
- **NEW**: Dedicated prescriptions tab with complete medication history

### 📅 **Appointment System**
- Advanced scheduling with dentist assignment
- Multiple appointment types (consultation, treatment, emergency)
- Status tracking and automated reminders
- **NEW**: Direct prescription linking for treatment context

### 🦷 **Treatment Management**
- Treatment definition library with pricing
- Multi-step treatment plans with progress tracking
- Procedure documentation and notes

### 💊 **Prescription Management** ⭐ **NEW MAJOR FEATURE**
- **Complete Drug Inventory**: Comprehensive drug catalog with categories, forms, and strengths
- **Prescription Lifecycle**: Create, edit, view, delete, and issue prescriptions
- **Patient Integration**: Direct access to patient prescriptions from patient details
- **Appointment Linking**: Connect prescriptions to specific appointments for context
- **Status Tracking**: Active, completed, cancelled, and expired prescription states
- **Security**: Role-based access control with data integrity protection
- **Professional Workflow**: Streamlined prescription creation and management

### 👨‍⚕️ **Staff & Clinic Management**
- Multi-clinic support with staff assignments
- Comprehensive staff profiles with qualifications
- Operating hours and facility management

### 📦 **Inventory Control**
- Multi-clinic inventory with stock levels
- Automated low-stock alerts
- Supplier management and expiry tracking

### 💰 **Billing & Financial Management** *(Admin/Manager Only)*
- Professional invoice generation with GST compliance
- Payment tracking and outstanding management
- Revenue analytics and financial reporting

### 📊 **Analytics & Reporting**
- Role-based dashboard visibility
- Clinic performance metrics
- Patient demographics and treatment analytics

## 🛠️ Technology Stack

- **Frontend**: React 18, Material-UI (MUI), Axios, React Router v6
- **Backend**: Node.js, Express.js, Mongoose, JWT Authentication
- **Database**: MongoDB Atlas (Cloud) with organization-based data partitioning
- **Charts**: Chart.js with React integration
- **PDF Generation**: React-PDF (@react-pdf/renderer) for text-based invoice PDFs; HTML print for browser printing
- **Notifications**: Real-time notification system with role-based alerts
- **Theme System**: Light/Dark mode with theme-aware components
- **Document Management**: File upload/download with Multer
- **Security**: bcrypt password hashing, JWT tokens, RBAC authorization
- **Prescription Management**: Complete drug and prescription lifecycle system
- **Data Validation**: Formik + Yup validation with comprehensive error handling

## 🚀 Quick Start

### 🎯 Demo Access (Ready to Use!)

**Try DentOS instantly with our pre-loaded demo organization:**

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@smilecare.com | Demo@2025 | Full Access + Revenue |
| **Manager** | manager@smilecare.com | Demo@2025 | Business + Revenue |
| **Dentist** | dentist@smilecare.com | Demo@2025 | Clinical Data |
| **Receptionist** | receptionist@smilecare.com | Demo@2025 | Front Desk |
| **Assistant** | assistant@smilecare.com | Demo@2025 | Limited Clinical |

**Demo Data Includes:**
- ✅ **Complete Organization**: Smile Care Dental Clinic with 2 branches
- ✅ **8 Patients** with complete medical histories and documents
- ✅ **Multiple Appointments** across different dates and clinics
- ✅ **Treatment Plans** with progress tracking and clinical notes
- ✅ **Inventory Management** with stock levels and alerts
- ✅ **Professional Invoices** with GST compliance and payment tracking
- ✅ **Staff Profiles** with qualifications and role-based access
- ✅ **Document Management** with file uploads and downloads
- ✅ **Communication System** with SMS and email tracking
- ✅ **Drug Inventory** with comprehensive drug catalog and categories
- ✅ **Prescription Management** with complete medication lifecycle tracking

### 🔐 User Roles & Access Levels

#### 👑 **Admin** - Full System Access
- **Financial Access**: Revenue, invoices, payments, financial reports
- **User Management**: Add/edit/delete users, manage team permissions
- **System Configuration**: Clinics, treatments, inventory, settings
- **All Data**: Complete access to all modules and information

#### 👨‍💼 **Manager** - Business Operations
- **Financial Oversight**: Revenue reports, payment tracking, analytics
- **Staff Coordination**: Appointments, schedules, staff management
- **Business Reports**: Comprehensive operational and financial reports
- **Limited Access**: Cannot manage users or system configuration

#### 🦷 **Dentist** - Clinical Focus
- **Patient Care**: Full patient records, medical history, treatments
- **Treatment Planning**: Create and manage treatment plans
- **Appointments**: Schedule and manage clinical appointments
- **Clinical Data**: Access to patient and treatment information only

#### 📞 **Receptionist** - Front Desk Operations
- **Appointments**: Schedule, reschedule, and manage appointments
- **Patient Check-in**: Handle patient arrivals and basic information
- **Communication**: Send reminders and notifications
- **Limited Access**: Basic patient info, no financial or clinical data

#### 🤝 **Assistant** - Clinical Support
- **Patient Support**: View patient information during procedures
- **Appointment Assistance**: Help prepare for appointments
- **Inventory Check**: View clinical supplies and inventory
- **Minimal Access**: Limited to support functions only

### 💻 Local Development Setup

#### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

#### Backend Setup
```bash
cd backend
npm install
# Create .env file with your MongoDB connection string
npm start
```

#### Frontend Setup
```bash
cd frontend
npm install
# Create .env file with your backend API URL
npm start
```

### 🚀 Production Deployment

#### Backend Deployment (Render)
1. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-connection
   JWT_SECRET=your-secure-jwt-secret
   JWT_EXPIRE=30d
   ```

2. **Deploy to Render**:
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `node server.js`
   - Add environment variables

#### Frontend Deployment (Vercel)
1. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

2. **Deploy to Vercel**:
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `build`
   - Add environment variables

#### Current Deployments
- **Backend**: https://dentos.onrender.com
- **Frontend**: https://dent-os.vercel.app

## 📁 Project Structure

### Frontend (React)
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Main application pages
│   ├── context/       # Global state management
│   ├── utils/         # Utility functions
│   └── pdf/           # PDF generation components
```

### Backend (Node.js/Express)
```
backend/
├── controllers/        # Business logic handlers
├── models/            # Database schemas
├── routes/            # API endpoints
├── middleware/        # Request processing
└── utils/             # Helper functions
```

## 🎯 Key Features

### **Multi-Tenant Architecture**
- **Complete Data Isolation**: Each organization's data is completely separate
- **Organization-Level Security**: All data is organization-specific
- **User Collaboration**: Role-based access within organizations

### **Clinic Management**
- **Multi-Clinic Support**: Manage multiple clinic branches
- **Clinic-Specific Data**: Filter all data by selected clinic
- **Staff Assignment**: Assign staff to specific clinics

### **Advanced RBAC**
- **Role-Based Access**: 5 distinct user roles with specific permissions
- **Clinic Access Control**: Admins can limit user access to specific clinics
- **Data Filtering**: Users only see data they're authorized to access

### **Professional Features**
- **Invoice Generation**: Professional PDF invoices with GST compliance
- **Document Management**: File upload/download with secure storage
- **Theme System**: Light/Dark mode with theme-aware components
- **Real-time Notifications**: Role-based alerts and updates

## 📄 Documentation

### **Essential Files**
- **`README.md`** - This comprehensive guide (installation, features, user roles, deployment)
- **`DEVELOPMENT_LOG.md`** - Complete development history and technical fixes
- **`TECHNICAL_DOCUMENTATION.md`** - Detailed technical architecture and API documentation

### **Project Cleanup** ✅
We've cleaned up the project by removing redundant documentation and development files:

**Removed Redundant Documentation:**
- Multiple deployment guides (consolidated into README.md)
- Multiple setup guides (consolidated into README.md)
- Fix summaries (already documented in DEVELOPMENT_LOG.md)
- Migration guides (already documented in DEVELOPMENT_LOG.md)
- Demo credentials (already in README.md)

**Removed Development Scripts:**
- Backend cleanup/migration scripts (no longer needed)
- Frontend update scripts (no longer needed)
- Debug scripts (no longer needed)
- Test scripts (no longer needed)

**Current Clean Structure:**
```
DentOS/
├── README.md                    # Comprehensive project guide
├── DEVELOPMENT_LOG.md           # Complete development history
├── TECHNICAL_DOCUMENTATION.md   # Technical architecture details
├── .gitignore                   # Git ignore rules
├── package.json                 # Root dependencies
├── backend/                     # Node.js/Express API server
│   ├── controllers/            # Business logic handlers
│   ├── models/                 # Database schemas
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Request processing
│   ├── utils/                  # Helper functions
│   ├── server.js               # Server entry point
│   ├── package.json            # Backend dependencies
│   └── render.yaml             # Render deployment config
└── frontend/                    # React.js client application
    ├── src/                    # Source code
    ├── public/                 # Static assets
    ├── package.json            # Frontend dependencies
    └── build/                  # Production build
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature-name`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add feature'`
5. **Push to the branch**: `git push origin feature-name`
6. **Submit a pull request**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the DEVELOPMENT_LOG.md for recent fixes and updates
- **Issues**: Report bugs or feature requests through GitHub issues
- **Demo Access**: Use the demo credentials above to explore the system

---

**DentOS** - Professional Dental Practice Management System  
*Built with React, Node.js, and MongoDB Atlas*