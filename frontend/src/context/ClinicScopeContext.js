import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/apiConfig';
import { useAuth } from './AuthContext';

const ClinicScopeContext = createContext();

export const ClinicScopeProvider = ({ children }) => {
  const { token } = useAuth();
  const [clinics, setClinics] = useState([]);
  // Initialize from localStorage synchronously to avoid flashing back to 'all'
  const [selected, setSelected] = useState(() => {
    try {
      return localStorage.getItem('clinicScope') || 'all';
    } catch (e) {
      return 'all';
    }
  }); // 'all' or clinicId

  // No need for a second pass load; state already seeded synchronously

  // Fetch clinics user can access
  useEffect(() => {
    const fetchClinics = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/clinics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success) {
          setClinics(res.data.data || []);
        }
      } catch (e) {
        console.error('Clinic fetch error', e);
      }
    };
    fetchClinics();
  }, [token]);

  // Persist selection
  useEffect(() => {
    localStorage.setItem('clinicScope', selected);
  }, [selected]);

  // When clinic changes, optionally trigger a soft refresh by emitting a custom event
  useEffect(() => {
    window.dispatchEvent(new Event('clinic-scope-changed'));
  }, [selected]);

  const value = useMemo(() => ({ clinics, selected, setSelected }), [clinics, selected]);
  return <ClinicScopeContext.Provider value={value}>{children}</ClinicScopeContext.Provider>;
};

export const useClinicScope = () => useContext(ClinicScopeContext);

export default ClinicScopeContext;


