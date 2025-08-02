# Dental CRM for Indian Clinic Chains

A comprehensive Customer Relationship Management system designed specifically for dental clinic chains in India. This application helps manage patients, appointments, treatments, staff, inventory, and analytics across multiple clinic locations.

## Features

- **Patient Management**: Store and manage patient records, medical history, and treatment plans
- **Document Management**: Upload, categorize, and manage patient documents and images
- **Patient Communication**: Send and track communications via SMS, WhatsApp, and email
- **Appointment Scheduling**: Book, reschedule, and cancel appointments with calendar integration
- **Treatment Tracking**: Track ongoing treatments, procedures, and follow-ups
- **Staff Management**: Manage dentists, assistants, and administrative staff across clinics
- **Inventory Management**: Track dental supplies and equipment
- **Billing & Payments**: Generate invoices and track payments
- **Analytics & Reporting**: Get insights on clinic performance, patient demographics, and revenue
- **Multi-Clinic Support**: Centralized management for multiple clinic locations
- **SMS/Email Notifications**: Automated reminders for appointments

## Technology Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT-based authentication
- **Notifications**: Twilio for SMS, Nodemailer for emails

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
4. Set up environment variables (see `.env.example` files in both directories)
5. Start the development servers:
   - Backend: `npm run dev` in the backend directory
   - Frontend: `npm start` in the frontend directory

## Project Structure

```
├── backend/             # Node.js Express backend
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
│
├── frontend/            # React.js frontend
│   ├── public/          # Static files
│   └── src/             # Source files
│       ├── components/  # Reusable components
│       ├── pages/       # Page components
│       ├── services/    # API services
│       ├── context/     # React context
│       ├── utils/       # Utility functions
│       └── App.js       # Main component
```

## Documentation

For detailed documentation, please refer to:

- [Technical Documentation](./TECHNICAL_DOCUMENTATION.md) - For experienced developers
- [Beginner's Guide](./BEGINNER_GUIDE.md) - For coding beginners

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Designed specifically for the Indian dental healthcare context
- Incorporates best practices from dental clinic management
- Optimized for multi-location clinic chains