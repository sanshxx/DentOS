import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Layout from './components/layout/Layout';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import OrganizationSetup from './pages/auth/OrganizationSetup';
import OrganizationChoice from './pages/auth/OrganizationChoice';
import JoinOrganization from './pages/auth/JoinOrganization';
import ChangePassword from './pages/auth/ChangePassword';

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
import TreatmentPlans from './pages/treatments/TreatmentPlans';

// Billing Components
import Invoices from './pages/billing/Invoices';
import CreateInvoice from './pages/billing/CreateInvoice';
import ViewInvoice from './pages/billing/ViewInvoice';
import EditInvoice from './pages/billing/EditInvoice';
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
import OrganizationCheck from './components/routing/OrganizationCheck';
import RootRedirect from './components/routing/RootRedirect';

// Team Components
import Team from './pages/team/Team';

// Theme is now handled by ThemeContext

// Debug: Log the API URL being used
console.log('🔍 Frontend Debug Info:');
console.log('   REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   Current URL:', window.location.href);

function App() {
  console.log('🔍 App.js Debug:');
  console.log('   Current pathname:', window.location.pathname);
  console.log('   Current search:', window.location.search);
  
  return (
    <AuthProvider>
      <ThemeProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Router>
            <ToastContainer position="top-right" autoClose={5000} />
            <Routes>
              {/* Default route - redirect based on authentication */}
              <Route path="/" element={<RootRedirect />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
              <Route path="/organization-setup" element={
                <PrivateRoute>
                  <OrganizationSetup />
                </PrivateRoute>
              } />
              <Route path="/organization-choice" element={
                <PrivateRoute>
                  <OrganizationChoice />
                </PrivateRoute>
              } />
              <Route path="/join-organization" element={
                <PrivateRoute>
                  <JoinOrganization />
                </PrivateRoute>
              } />
              <Route path="/change-password" element={
                <PrivateRoute>
                  <ChangePassword />
                </PrivateRoute>
              } />
              
              {/* Dashboard Route */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <OrganizationCheck>
                    <Layout />
                  </OrganizationCheck>
                </PrivateRoute>
              }>
                <Route index element={<Dashboard />} />
              </Route>
              
              {/* Patient Routes */}
              <Route path="/patients" element={
                <PrivateRoute>
                  <OrganizationCheck>
                    <Layout />
                  </OrganizationCheck>
                </PrivateRoute>
              }>
                <Route index element={<Patients />} />
                <Route path="add" element={<AddPatient />} />
                <Route path=":id" element={<PatientDetails />} />
                <Route path=":id/edit" element={<EditPatient />} />
              </Route>
              
              {/* Appointment Routes */}
              <Route path="/appointments" element={
                <PrivateRoute>
                  <OrganizationCheck>
                    <Layout />
                  </OrganizationCheck>
                </PrivateRoute>
              }>
                <Route index element={<Appointments />} />
                <Route path="add" element={<AddAppointment />} />
                <Route path=":id" element={<AppointmentDetails />} />
                <Route path=":id/edit" element={<EditAppointment />} />
              </Route>
              
              {/* Calendar Route */}
              <Route path="/calendar" element={
                <PrivateRoute>
                  <OrganizationCheck>
                    <Layout />
                  </OrganizationCheck>
                </PrivateRoute>
              }>
                <Route index element={<Calendar />} />
              </Route>
              
              {/* Treatment Routes */}
              <Route path="/treatments" element={
                <PrivateRoute>
                  <OrganizationCheck>
                    <Layout />
                  </OrganizationCheck>
                </PrivateRoute>
              }>
                <Route index element={<Treatments />} />
                <Route path="add" element={<AddTreatment />} />
                <Route path=":id" element={<TreatmentDetails />} />
                <Route path=":id/edit" element={<EditTreatment />} />
                <Route path="plans" element={<TreatmentPlans />} />
              </Route>
              
              {/* Billing Routes */}
              <Route path="/billing" element={
                <PrivateRoute>
                  <OrganizationCheck>
                    <Layout />
                  </OrganizationCheck>
                </PrivateRoute>
              }>
                <Route index element={<Invoices />} />
                <Route path="create" element={<CreateInvoice />} />
                <Route path="invoice/:id" element={<ViewInvoice />} />
                <Route path="invoice/:id/edit" element={<EditInvoice />} />
                <Route path="invoice/:id/payment" element={<RecordPayment />} />
              </Route>
              
              {/* Inventory Routes */}
              <Route path="/inventory" element={
                <PrivateRoute>
                  <OrganizationCheck>
                    <Layout />
                  </OrganizationCheck>
                </PrivateRoute>
              }>
                <Route index element={<Inventory />} />
                <Route path="add" element={<AddInventory />} />
                <Route path=":id" element={<InventoryDetails />} />
                <Route path=":id/edit" element={<EditInventory />} />
              </Route>
              
              {/* Clinic Routes */}
              <Route path="/clinics" element={
                <PrivateRoute>
                  <OrganizationCheck>
                    <Layout />
                  </OrganizationCheck>
                </PrivateRoute>
              }>
                <Route index element={<Clinics />} />
                <Route path=":id" element={<ClinicDetails />} />
              </Route>
              
              {/* Staff Routes */}
              <Route path="/staff" element={
                <PrivateRoute>
                  <OrganizationCheck>
                    <Layout />
                  </OrganizationCheck>
                </PrivateRoute>
              }>
                <Route index element={<Staff />} />
                <Route path=":id" element={<StaffDetails />} />
              </Route>
              
              {/* Team Route */}
              <Route path="/team" element={
                <PrivateRoute>
                  <OrganizationCheck>
                    <Layout />
                  </OrganizationCheck>
                </PrivateRoute>
              }>
                <Route index element={<Team />} />
              </Route>
              
              {/* Reports Route */}
              <Route path="/reports" element={
                <PrivateRoute>
                  <OrganizationCheck>
                    <Layout />
                  </OrganizationCheck>
                </PrivateRoute>
              }>
                <Route index element={<Reports />} />
              </Route>
              
              {/* Settings Routes */}
              <Route path="/settings" element={
                <PrivateRoute>
                  <OrganizationCheck>
                    <Layout />
                  </OrganizationCheck>
                </PrivateRoute>
              }>
                <Route index element={<Settings />} />
              </Route>
              
              <Route path="/profile" element={
                <PrivateRoute>
                  <OrganizationCheck>
                    <Layout />
                  </OrganizationCheck>
                </PrivateRoute>
              }>
                <Route index element={<Profile />} />
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