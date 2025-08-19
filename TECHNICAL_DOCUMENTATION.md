# DentOS - Technical Documentation

## Overview

DentOS is a comprehensive web application designed to streamline dental practice management. It provides an integrated solution for managing patients, appointments, treatments, billing, inventory, staff, and reporting in dental clinics. The application aims to improve operational efficiency, enhance patient care, and provide valuable insights through data analytics.

## Technical Architecture

### Frontend

- **Framework**: React.js with functional components and hooks
- **UI Library**: Material UI (MUI) for consistent, responsive design
- **State Management**: Context API for global state (AuthContext, ThemeContext)
- **Routing**: React Router v6 for navigation
- **Date Handling**: date-fns with MUI Date Pickers
- **Data Visualization**: Recharts for reports and analytics
- **Theme System**: Light/Dark mode with theme-aware components
- **File Management**: Document upload/download with blob handling
- **Notifications**: Real-time notification system with role-based filtering
- **PDF Generation**: React-PDF (@react-pdf/renderer) for text-based invoice PDFs; print-friendly HTML templates for browser printing

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB with Mongoose ODM
- **API Structure**: RESTful API endpoints
- **Middleware**: Custom authentication middleware
- **File Upload**: Multer for document management
- **Notifications**: Real-time notification system with TTL indexes
- **Error Handling**: Comprehensive error handling with custom responses

### Database Schema

#### User Model
- Authentication and staff management
- Role-based access control (admin, manager, dentist, receptionist, assistant)

#### Patient Model
- Personal information
- Medical history
- Treatment history
- Contact details
- Document management (references to PatientDocument model)
- Communication history (references to Communication model)

#### Prescription Model ⭐ **NEW**
- Prescription number and metadata
- Patient and doctor references
- Appointment linking for treatment context
- Diagnosis and clinical notes
- Medications array with drug details, dosage, frequency, duration, and instructions
- Status tracking (active, completed, cancelled, expired)
- Issue tracking (issued to patient with timestamp and user)
- Organization and clinic scoping for multi-tenant support

#### Drug Model ⭐ **NEW**
- Drug name, strength, and form (tablet, capsule, syrup, injection, etc.)
- Category classification (antibiotics, painkillers, anti-inflammatory, etc.)
- Manufacturer information and description
- Organization and clinic scoping for multi-tenant support

#### Appointment Model
- Scheduling information
- Patient and dentist references
- Status tracking
- Appointment notes

#### Treatment Model
- Treatment types and procedures
- Pricing information
- Treatment plans

#### Invoice Model
- Billing information
- Payment tracking
- GST/tax handling
- Line items for treatments

#### Inventory Model
- Dental supplies and equipment
- Stock management
- Reorder tracking

#### Clinic Model
- Multiple location support
- Clinic details and operating hours

#### Notification Model
- Real-time notifications
- Role-based filtering
- TTL indexes for auto-cleanup
- User-specific notifications

#### PatientDocument Model
- Document storage and management
- File metadata and access tracking
- Secure file paths and permissions
- Download and upload logging

## Component Structure

### Frontend Components

#### Layout Components
- `Layout.js`: Main application layout with header, sidebar, and content area
- `Sidebar.js`: Navigation menu with role-based access control
- `PrivateRoute.js`: Route protection based on authentication

#### Authentication Components
- `Login.js`: User authentication
- `Register.js`: New user registration
- `ForgotPassword.js`: Password recovery

#### Patient Management
- `Patients.js`: Patient listing with search and filtering
- `AddPatient.js`: Patient creation form
- `EditPatient.js`: Patient editing form
- `PatientDetails.js`: Comprehensive patient view with tabs
- `PatientList.js`: Patient list component

#### Prescription Management ⭐ **NEW**
- `Prescriptions.js`: Main prescription listing with filtering and actions
- `AddPrescription.js`: Prescription creation form with patient/appointment linking
- `EditPrescription.js`: Prescription editing form with validation
- `PrescriptionDetails.js`: Comprehensive prescription view
- `Drugs.js`: Drug inventory management
- `AddDrug.js`: Drug creation form
- `EditDrug.js`: Drug editing form
- `DrugDetails.js`: Drug information display

#### Appointment Management
- `Appointments.js`: Appointment listing and management
- `AddAppointment.js`: Appointment creation form
- `EditAppointment.js`: Appointment editing form
- `AppointmentDetails.js`: Appointment information display
- `AppointmentCalendar.js`: Calendar view for appointments
- `AppointmentList.js`: List view for appointments

#### Treatment Management
- `Treatments.js`: Treatment catalog
- `TreatmentPlans.js`: Patient-specific treatment planning

#### Billing Module
- `Invoices.js`: Invoice listing with search and filtering
- `CreateInvoice.js`: Invoice generation form
- `ViewInvoice.js`: Detailed invoice view
- `RecordPayment.js`: Payment recording interface

#### Inventory Management
- `Inventory.js`: Stock listing and management

#### Reporting
- `Reports.js`: Analytics dashboard with charts and metrics

#### Settings
- `Settings.js`: Application configuration

### Backend Structure

#### Controllers
- `auth.js`: Authentication logic
- `patients.js`: Patient CRUD operations
- `appointments.js`: Appointment management
- `treatments.js`: Treatment catalog and plans
- `billing.js`: Invoice and payment processing
- `inventory.js`: Stock management
- `reports.js`: Data aggregation for analytics

#### Routes
- RESTful endpoints corresponding to each controller
- Protected routes with authentication middleware

#### Middleware
- `auth.js`: JWT verification and role checking

#### Models
- Mongoose schemas for all data entities
- Validation and business logic

##### PatientDocument Model
- References to patient
- File metadata (name, type, size, path)
- Document category and description
- Upload information (date, user)
- Tags for searchability
- Access log for compliance tracking
- Soft delete functionality

##### Communication Model
- References to patient and sender
- Communication channel (SMS, WhatsApp, Email)
- Message content and subject (for emails)
- Status tracking (sent, delivered, read, failed)
- Timestamps for sending and delivery
- Response tracking
- Bulk communication capabilities

#### Utils
- `sendEmail.js`: Email notification service
- `sendSMS.js`: SMS notification service
- `fileUpload.js`: Document upload and management service

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/updatedetails` - Update user details

### Patients
- `GET /api/patients` - Get all patients (with filtering)
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Prescriptions ⭐ **NEW**
- `GET /api/prescriptions` - Get all prescriptions (with filtering)
- `POST /api/prescriptions` - Create new prescription
- `GET /api/prescriptions/:id` - Get prescription details
- `PUT /api/prescriptions/:id` - Update prescription
- `DELETE /api/prescriptions/:id` - Delete prescription
- `PUT /api/prescriptions/:id/issue` - Issue prescription to patient
- `GET /api/prescriptions/patient/:patientId` - Get prescriptions by patient
- `GET /api/prescriptions/doctor/:doctorId` - Get prescriptions by doctor

### Drugs ⭐ **NEW**
- `GET /api/drugs` - Get all drugs (with filtering)
- `POST /api/drugs` - Create new drug
- `GET /api/drugs/:id` - Get drug details
- `PUT /api/drugs/:id` - Update drug
- `DELETE /api/drugs/:id` - Delete drug
- `GET /api/drugs/categories` - Get all drug categories
- `GET /api/drugs/forms` - Get all drug forms

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Treatments
- `GET /api/treatments` - Get all treatments
- `POST /api/treatments` - Create new treatment
- `GET /api/treatments/:id` - Get treatment details
- `PUT /api/treatments/:id` - Update treatment
- `DELETE /api/treatments/:id` - Delete treatment

### Billing
- `GET /api/billing` - Get all invoices
- `POST /api/billing` - Create new invoice
- `GET /api/billing/:id` - Get invoice details
- `PUT /api/billing/:id` - Update invoice
- `DELETE /api/billing/:id` - Delete invoice
- `POST /api/billing/:id/payments` - Record payment
- `PUT /api/billing/:id/payments/:paymentId` - Update payment
- `DELETE /api/billing/:id/payments/:paymentId` - Delete payment

### Inventory
- `GET /api/inventory`: List all items
- `GET /api/inventory/:id`: Get single item
- `POST /api/inventory`: Create item
- `PUT /api/inventory/:id`: Update item
- `DELETE /api/inventory/:id`: Delete item

### Reports
- `GET /api/reports/revenue`: Revenue analytics
- `GET /api/reports/appointments`: Appointment analytics
- `GET /api/reports/treatments`: Treatment analytics

## Authentication and Authorization

The application uses JWT (JSON Web Tokens) for authentication. When a user logs in, the server generates a token that is stored in the client's local storage. This token is included in the Authorization header for all subsequent API requests.

Authorization is handled through role-based access control. The available roles are:

- **Admin**: Full access to all features
- **Manager**: Access to most features except sensitive administrative functions
- **Dentist**: Access to patient records, appointments, and treatments
- **Receptionist**: Access to appointments, billing, and basic patient information
- **Assistant**: Limited access to appointments and inventory

The frontend sidebar menu dynamically adjusts based on the user's role, showing only the relevant navigation options.

## Data Flow

1. **User Authentication**:
   - User submits credentials
   - Server validates and returns JWT
   - Token stored in local storage
   - AuthContext provides authentication state to all components

2. **Protected Routes**:
   - PrivateRoute component checks for valid token
   - Redirects to login if not authenticated
   - Checks role permissions for specific routes

3. **API Requests**:
   - Axios interceptors add Authorization header
   - Server middleware validates token
   - Controllers process requests based on business logic
   - Mongoose models interact with MongoDB

4. **Real-time Updates**:
   - Polling for appointment changes
   - Notifications for new appointments and payments

## Error Handling

- Frontend uses try/catch blocks with error state management
- Backend uses middleware for error handling and consistent responses
- HTTP status codes for different error types
- Validation errors returned with descriptive messages
- Comprehensive error handling for file uploads and downloads
- Token validation and automatic session refresh
- DOM context error handling for browser compatibility

## Recent Feature Implementations

### Theme System
- **ThemeContext**: React Context for global theme state management
- **ThemeProvider**: Custom provider with Material-UI theme integration
- **Theme-Aware Components**: All UI components adapt to light/dark themes
- **Persistent Storage**: Theme preference saved in localStorage
- **Automatic Adaptation**: Tables, cards, menus, and forms follow theme

### Notification System
- **Real-time Notifications**: MongoDB-based notification system with TTL indexes
- **Role-based Filtering**: Notifications filtered by user role and permissions
- **Notification Bell**: UI component for viewing recent notifications
- **Auto-cleanup**: Expired notifications automatically removed
- **Multiple Types**: Appointment reminders, patient updates, inventory alerts

### Document Management
- **File Upload**: Multer middleware for secure file handling
- **Multiple Formats**: Support for PDF, images, DICOM, and other formats
- **Access Control**: Role-based document access and download tracking
- **Secure Storage**: Files stored with proper permissions and metadata
- **Download System**: Blob-based file download with error handling
- **DOM Context Fixes**: Browser compatibility for file operations

## Future Roadmap

### Short-term Enhancements

1. **Patient Portal**:
   - Self-service appointment booking
   - Treatment history access
   - Online payment processing
   - Secure messaging with dental staff
   - Document access and download
   - Communication preferences management

2. **Advanced Reporting**:
   - Custom report builder
   - Export to PDF/Excel
   - Scheduled report generation
   - Financial forecasting

3. **Integration Capabilities**:
   - Dental imaging systems
   - Insurance providers API
   - Payment gateways
   - SMS/Email marketing tools

### Mobile App Integration

1. **Technology Stack**:
   - React Native for cross-platform compatibility
   - Shared API with web application
   - Offline capabilities with local storage
   - Push notifications

2. **Mobile-specific Features**:
   - Appointment check-in
   - Digital patient forms
   - Treatment photo capture
   - Staff task management
   - Inventory barcode scanning

3. **Implementation Approach**:
   - Reuse authentication and data models
   - Optimize UI for mobile experience
   - Implement responsive design patterns
   - Focus on core functionality first (appointments, patient records)
   - Add advanced features in subsequent releases

### Long-term Vision

1. **AI-powered Diagnostics**:
   - Integration with dental imaging AI
   - Treatment recommendation engine
   - Predictive analytics for patient conditions

2. **Teledentistry Module**:
   - Video consultation
   - Remote diagnosis capabilities
   - Digital treatment planning

3. **Multi-practice Management**:
   - Dental group practice support
   - Cross-location appointment booking
   - Centralized reporting
   - Staff scheduling across locations

## Deployment Considerations

- Environment variables for sensitive configuration
- MongoDB Atlas for database hosting
- Containerization with Docker
- CI/CD pipeline for automated testing and deployment
- Scalable architecture for growing practices

## Performance Optimization

- Database indexing for frequently queried fields
- Pagination for large data sets
- Caching strategies for reports and static content
- Code splitting for faster initial load
- Image optimization for patient records

## Security Measures

- HTTPS for all communications
- Password hashing with bcrypt
- JWT expiration and refresh tokens
- Input validation and sanitization
- HIPAA compliance considerations for patient data
- Regular security audits

## Conclusion

The DentOS application provides a comprehensive solution for dental practice management with a modern, scalable architecture. This technical documentation serves as a guide for developers working on maintaining and extending the application's capabilities.

## Technical Patterns & Features

### Authentication & Authorization
- JWT-based authentication with automatic token refresh
- Role-based access control (RBAC) middleware
- Clinic scope middleware for multi-tenant data isolation
- Protected routes with role-specific permissions

### Data Management
- Mongoose ODM with comprehensive schema validation
- Population for related data fetching
- Pagination for large datasets
- Search and filtering capabilities

### Prescription Management System ⭐ **NEW**
- **Drug Inventory**: Complete drug catalog with categories and forms
- **Prescription Lifecycle**: Full CRUD operations with status tracking
- **Patient Integration**: Direct access from patient details
- **Appointment Linking**: Context-aware prescription creation
- **Security**: Data integrity protection for issued prescriptions
- **Validation**: Comprehensive frontend and backend validation
- **Multi-tenant**: Organization and clinic-specific data isolation

### Form Handling & Validation
- Formik for form state management
- Yup for schema validation
- Material-UI components with consistent styling
- Real-time validation feedback

### Error Handling
- Centralized error handling middleware
- Consistent error response format
- User-friendly error messages
- Graceful degradation for missing data

### File Management
- Multer for file uploads
- Secure file storage with metadata
- Download tracking and access control
- Support for multiple file types