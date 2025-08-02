import React from 'react';
import AppointmentCalendar from './AppointmentCalendar';

/**
 * Calendar component - Wrapper for AppointmentCalendar
 * This component exists to maintain compatibility with routes defined in App.js
 */
const Calendar = () => {
  return <AppointmentCalendar />;
};

export default Calendar;