# Dental CRM - Technical Documentation

## Overview

Dental CRM is a comprehensive web application designed to streamline dental practice management. It provides an integrated solution for managing patients, appointments, treatments, billing, inventory, staff, and reporting in dental clinics. The application aims to improve operational efficiency, enhance patient care, and provide valuable insights through data analytics.

## Technical Architecture

### Frontend

- **Framework**: React.js with functional components and hooks
- **UI Library**: Material UI (MUI) for consistent, responsive design
- **State Management**: Context API for global state (AuthContext)
- **Routing**: React Router v6 for navigation
- **Date Handling**: date-fns with MUI Date Pickers
- **Data Visualization**: Recharts for reports and analytics

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB with Mongoose ODM
- **API Structure**: RESTful API endpoints
- **Middleware**: Custom authentication middleware

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
- `PatientDetails.js`: Comprehensive patient information with document management and communication features
- `CreatePatient.js`: Patient registration form

#### Appointment Management
- `Appointments.js`: Appointment listing
- `Calendar.js`: Visual calendar interface
- `CreateAppointment.js`: Appointment scheduling form

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
- `POST /api/auth/register`: Create new user
- `POST /api/auth/login`: Authenticate user
- `POST /api/auth/forgot-password`: Initiate password reset
- `POST /api/auth/reset-password`: Complete password reset

### Patients
- `GET /api/patients`: List all patients
- `GET /api/patients/:id`: Get single patient
- `POST /api/patients`: Create patient
- `PUT /api/patients/:id`: Update patient
- `DELETE /api/patients/:id`: Delete patient

### Patient Documents
- `GET /api/patients/:patientId/documents`: List all documents for a patient
- `GET /api/patients/:patientId/documents/:id`: Get single document
- `POST /api/patients/:patientId/documents`: Upload document
- `GET /api/patients/:patientId/documents/:id/download`: Download document
- `PUT /api/patients/:patientId/documents/:id`: Update document details
- `DELETE /api/patients/:patientId/documents/:id`: Delete document
- `GET /api/patients/:patientId/documents/search`: Search documents

### Patient Communications
- `GET /api/patients/:patientId/communications`: List all communications for a patient
- `GET /api/patients/:patientId/communications/:id`: Get single communication
- `POST /api/patients/:patientId/communications`: Send communication
- `PUT /api/patients/:patientId/communications/:id/status`: Update communication status
- `GET /api/patients/:patientId/communications/stats`: Get communication statistics
- `POST /api/patients/communications/bulk`: Send bulk communications

### Appointments
- `GET /api/appointments`: List all appointments
- `GET /api/appointments/:id`: Get single appointment
- `POST /api/appointments`: Create appointment
- `PUT /api/appointments/:id`: Update appointment
- `DELETE /api/appointments/:id`: Delete appointment

### Treatments
- `GET /api/treatments`: List all treatments
- `GET /api/treatments/:id`: Get single treatment
- `POST /api/treatments`: Create treatment
- `PUT /api/treatments/:id`: Update treatment
- `DELETE /api/treatments/:id`: Delete treatment
- `GET /api/treatments/plans`: List treatment plans
- `POST /api/treatments/plans`: Create treatment plan

### Billing
- `GET /api/billing`: List all invoices
- `GET /api/billing/:id`: Get single invoice
- `POST /api/billing`: Create invoice
- `PUT /api/billing/:id`: Update invoice
- `DELETE /api/billing/:id`: Delete invoice
- `POST /api/billing/:id/payment`: Record payment

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

The Dental CRM application provides a comprehensive solution for dental practice management with a modern, scalable architecture. This technical documentation serves as a guide for developers working on maintaining and extending the application's capabilities.