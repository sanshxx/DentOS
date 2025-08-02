import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Layout Components
import Layout from './components/layout/Layout';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard Components
import Dashboard from './pages/dashboard/Dashboard';

// Patient Components
import Patients from './pages/patients/Patients';
import PatientDetails from './pages/patients/PatientDetails';
import AddPatient from './pages/patients/AddPatient';
import EditPatient from './pages/patients/EditPatient';

// Appointment Components
import Appointments from './pages/appointments/Appointments';
import AppointmentDetails from './pages/appointments/AppointmentDetails';
import AddAppointment from './pages/appointments/AddAppointment';
import EditAppointment from './pages/appointments/EditAppointment';
import Calendar from './pages/appointments/Calendar';

// Treatment Components
import Treatments from './pages/treatments/Treatments';
import TreatmentDetails from './pages/treatments/TreatmentDetails';
import AddTreatment from './pages/treatments/AddTreatment';
import EditTreatment from './pages/treatments/EditTreatment';

// Billing Components
import Invoices from './pages/billing/Invoices';
import CreateInvoice from './pages/billing/CreateInvoice';
import ViewInvoice from './pages/billing/ViewInvoice';
import RecordPayment from './pages/billing/RecordPayment';

// Inventory Components
import Inventory from './pages/inventory/Inventory';
import InventoryDetails from './pages/inventory/InventoryDetails';
import AddInventory from './pages/inventory/AddInventory';
import EditInventory from './pages/inventory/EditInventory';

// Clinic Components
import Clinics from './pages/clinics/Clinics';
import ClinicDetails from './pages/clinics/ClinicDetails';

// Staff Components
import Staff from './pages/staff/Staff';
import StaffDetails from './pages/staff/StaffDetails';

// Reports Components
import Reports from './pages/reports/Reports';

// Settings Components
import Settings from './pages/settings/Settings';
import Profile from './pages/settings/Profile';

// Error Pages
import NotFound from './pages/errors/NotFound';

// Context
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#2e7d32',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Router>
            <ToastContainer position="top-right" autoClose={5000} />
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
              
              {/* App Routes */}
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                
                {/* Patient Routes */}
                <Route path="patients" element={<Patients />} />
                <Route path="patients/add" element={<AddPatient />} />
                <Route path="patients/:id" element={<PatientDetails />} />
                <Route path="patients/:id/edit" element={<EditPatient />} />
                
                {/* Appointment Routes */}
                <Route path="appointments" element={<Appointments />} />
                <Route path="appointments/add" element={<AddAppointment />} />
                <Route path="appointments/:id" element={<AppointmentDetails />} />
                <Route path="appointments/:id/edit" element={<EditAppointment />} />
                <Route path="calendar" element={<Calendar />} />
                
                {/* Treatment Routes */}
                <Route path="treatments" element={<Treatments />} />
                <Route path="treatments/add" element={<AddTreatment />} />
                <Route path="treatments/:id" element={<TreatmentDetails />} />
                <Route path="treatments/:id/edit" element={<EditTreatment />} />
                
                {/* Billing Routes */}
                <Route path="billing" element={<Invoices />} />
                <Route path="billing/create" element={<CreateInvoice />} />
                <Route path="billing/invoice/:id" element={<ViewInvoice />} />
                <Route path="billing/invoice/:id/payment" element={<RecordPayment />} />
                
                {/* Inventory Routes */}
                <Route path="inventory" element={<Inventory />} />
                <Route path="inventory/add" element={<AddInventory />} />
                <Route path="inventory/:id" element={<InventoryDetails />} />
                <Route path="inventory/:id/edit" element={<EditInventory />} />
                
                {/* Clinic Routes */}
                <Route path="clinics" element={<Clinics />} />
                <Route path="clinics/:id" element={<ClinicDetails />} />
                
                {/* Staff Routes */}
                <Route path="staff" element={<Staff />} />
                <Route path="staff/:id" element={<StaffDetails />} />
                
                {/* Reports Routes */}
                <Route path="reports" element={<Reports />} />
                
                {/* Settings Routes */}
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;