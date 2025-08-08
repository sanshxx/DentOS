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

### 📅 **Appointment System**
- Advanced scheduling with dentist assignment
- Multiple appointment types (consultation, treatment, emergency)
- Status tracking and automated reminders

### 🦷 **Treatment Management**
- Treatment definition library with pricing
- Multi-step treatment plans with progress tracking
- Procedure documentation and notes

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
- **PDF Generation**: jsPDF with HTML-to-PDF conversion
- **Notifications**: Real-time notification system with role-based alerts
- **Theme System**: Light/Dark mode with theme-aware components
- **Document Management**: File upload/download with Multer
- **Security**: bcrypt password hashing, JWT tokens, RBAC authorization

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

### 💻 Local Development Setup

#### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

#### Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DentOS
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your MongoDB URI and other settings
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Configure REACT_APP_API_URL
   npm start
   ```

4. **Create Demo Data** (Optional)
   ```bash
   cd backend
   node create-demo-organization.js
   ```

## 📁 Project Structure

```
DentOS/
├── backend/                    # Node.js Express API Server
│   ├── controllers/           # Business logic & API handlers
│   │   ├── auth.js           # Authentication & user management
│   │   ├── organizations.js  # Multi-tenant organization logic
│   │   ├── patients.js       # Patient management
│   │   ├── appointments.js   # Appointment scheduling
│   │   ├── treatments.js     # Treatment definitions & plans
│   │   ├── billing.js        # Invoice & payment management
│   │   ├── inventory.js      # Stock & supply management
│   │   ├── staff.js          # Staff & clinic management
│   │   └── dashboard.js      # Analytics & reporting
│   ├── models/               # MongoDB Mongoose schemas
│   │   ├── Organization.js   # Multi-tenant organization model
│   │   ├── User.js          # User accounts with RBAC
│   │   ├── Patient.js       # Patient records
│   │   ├── Appointment.js   # Appointment scheduling
│   │   ├── Treatment.js     # Treatment plans
│   │   ├── Invoice.js       # Billing & invoices
│   │   ├── Inventory.js     # Inventory management
│   │   ├── Staff.js         # Staff profiles
│   │   └── Clinic.js        # Clinic locations
│   ├── routes/              # API route definitions
│   ├── middleware/          # Authentication & validation
│   ├── utils/              # Helper functions & utilities
│   └── server.js           # Express server entry point
│
├── frontend/                   # React.js Client Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── layout/       # Layout components (Sidebar, Header)
│   │   │   └── routing/      # Route protection & organization checks
│   │   ├── pages/            # Main application pages
│   │   │   ├── auth/         # Login, Register, Organization setup
│   │   │   ├── dashboard/    # Role-based dashboard
│   │   │   ├── patients/     # Patient management
│   │   │   ├── appointments/ # Appointment scheduling
│   │   │   ├── treatments/   # Treatment management
│   │   │   ├── billing/      # Invoice & payment management
│   │   │   ├── inventory/    # Stock management
│   │   │   ├── staff/        # Staff management
│   │   │   ├── team/         # User & organization management
│   │   │   └── reports/      # Analytics & reporting
│   │   ├── context/          # React Context (Authentication)
│   │   ├── utils/           # Helper functions (PDF generation, etc.)
│   │   └── App.js           # Main application component
│   └── public/              # Static assets
│
└── Documentation/             # Comprehensive documentation
    ├── DEVELOPMENT_LOG.md    # Development progress & fixes
    ├── ORGANIZATION_SETUP_GUIDE.md # Multi-tenant setup guide
    ├── TECHNICAL_DOCUMENTATION.md  # Technical architecture
    └── USER_GUIDE.md        # End-user documentation
```

## 📚 Documentation

### For Developers
- **[Development Log](./DEVELOPMENT_LOG.md)** - Complete development history and fixes
- **[Technical Documentation](./TECHNICAL_DOCUMENTATION.md)** - Architecture and implementation details
- **[Organization Setup Guide](./ORGANIZATION_SETUP_GUIDE.md)** - Multi-tenant system guide

### For Users
- **[User Guide](./USER_GUIDE.md)** - Complete user manual for all features
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment instructions

## 🏆 Key Achievements

✅ **Complete Multi-Tenancy** - Full data isolation between organizations  
✅ **Advanced RBAC** - Five-tier role-based access control  
✅ **Professional PDF Generation** - Clean, GST-compliant invoices  
✅ **Real-time Dashboard** - Role-based analytics and insights  
✅ **Theme System** - Light/Dark mode with theme-aware components  
✅ **Document Management** - File upload/download with robust error handling  
✅ **Notification System** - Real-time alerts with role-based filtering  
✅ **Comprehensive Demo** - Ready-to-use demo organization with complete data  
✅ **Production Ready** - Deployment-ready with proper security and error handling  

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Indian Healthcare Context**: Designed specifically for Indian dental practices
- **GST Compliance**: Built-in GST calculations and invoice formatting
- **Multi-Clinic Operations**: Optimized for clinic chains and multi-location practices
- **Modern Architecture**: Following current best practices for scalable web applications