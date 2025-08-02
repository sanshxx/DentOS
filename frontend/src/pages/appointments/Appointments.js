import React from 'react';
import AppointmentList from './AppointmentList';

/**
 * Appointments component - Wrapper for AppointmentList
 * This component exists to maintain compatibility with routes defined in App.js
 */
const Appointments = () => {
  return <AppointmentList />;
};

export default Appointments;