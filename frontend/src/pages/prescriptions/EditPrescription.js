import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  LocalPharmacy as PharmacyIcon
} from '@mui/icons-material';
import { drugAPI } from '../../api/drugs';
import { patientAPI } from '../../api/patients';
import { appointmentAPI } from '../../api/appointments';
import { useAuth } from '../../context/AuthContext';

const EditPrescription = ({ open, prescription, onClose, onEdit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patient: '',
    appointment: '',
    diagnosis: '',
    medications: [{
      drug: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1,
      unit: 'tablets',
      beforeMeal: false,
      afterMeal: false
    }],
    instructions: '',
    followUpDate: '',
    notes: ''
  });
  
  const [drugs, setDrugs] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (open && prescription) {
      loadDrugs();
      loadPatients();
    }
  }, [open, prescription]);
  
  // Populate form after patients loaded
  useEffect(() => {
    if (prescription && patients.length >= 0) {
      populateForm();
    }
  }, [prescription, patients]);
  
  // Ensure selected patient and appointment are present in lists
  useEffect(() => {
    const ensureSelectedEntitiesPresent = async () => {
      if (!open || !prescription) return;
      const selectedPatientId = prescription.patient?._id || prescription.patient;
      if (selectedPatientId && !patients.find(p => p._id === selectedPatientId)) {
        try {
          const res = await patientAPI.getPatient(selectedPatientId);
          const p = res.data;
          if (p && p._id) setPatients(prev => [p, ...prev.filter(x => x._id !== p._id)]);
        } catch (e) {}
      }
      const selectedAppointmentId = prescription.appointment?._id || prescription.appointment;
      if (selectedAppointmentId && !appointments.find(a => a._id === selectedAppointmentId)) {
        try {
          const res = await appointmentAPI.getAppointment(selectedAppointmentId);
          const a = res.data;
          if (a && a._id) setAppointments(prev => [a, ...prev.filter(x => x._id !== a._id)]);
        } catch (e) {}
      }
    };
    ensureSelectedEntitiesPresent();
  }, [open, prescription, patients, appointments]);
  
  useEffect(() => {
    if (formData.patient) {
      loadPatientAppointments(formData.patient);
    }
  }, [formData.patient]);
  
  const loadDrugs = async () => {
    try {
      const response = await drugAPI.getDrugs({ limit: 1000, isActive: true });
      setDrugs(response.data.docs || []);
    } catch (err) {
      console.error('Error loading drugs:', err);
    }
  };
  
  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await patientAPI.getPatients({ limit: 1000 });
      setPatients(response.data || []);
    } catch (err) {
      console.error('Error loading patients:', err);
    } finally {
      setLoadingPatients(false);
    }
  };
  
  const loadPatientAppointments = async (patientId) => {
    if (!patientId) {
      setAppointments([]);
      return;
    }
    
    try {
      setLoadingAppointments(true);
      const response = await appointmentAPI.getPatientAppointments(patientId);
      setAppointments(response.data || []);
    } catch (err) {
      console.error('Error loading patient appointments:', err);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };
  
  const populateForm = () => {
    if (prescription) {
      const formDataToSet = {
        patient: prescription.patient?._id || prescription.patient || '',
        appointment: prescription.appointment?._id || prescription.appointment || '',
        diagnosis: prescription.diagnosis || '',
        medications: prescription.medications && prescription.medications.length > 0 
          ? prescription.medications.map(med => ({
              drug: med.drug?._id || med.drug || '',
              dosage: med.dosage || '',
              frequency: med.frequency || '',
              duration: med.duration || '',
              instructions: med.instructions || '',
              quantity: med.quantity || 1,
              unit: med.unit || 'tablets',
              beforeMeal: med.beforeMeal || false,
              afterMeal: med.afterMeal || false
            }))
          : [{
              drug: '',
              dosage: '',
              frequency: '',
              duration: '',
              instructions: '',
              quantity: 1,
              unit: 'tablets',
              beforeMeal: false,
              afterMeal: false
            }],
        instructions: prescription.instructions || '',
        followUpDate: prescription.followUpDate ? new Date(prescription.followUpDate).toISOString().split('T')[0] : '',
        notes: prescription.notes || ''
      };
      setFormData(formDataToSet);
    }
  };
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const handleMedicationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => i === index ? { ...med, [field]: value } : med)
    }));
  };
  
  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { drug: '', dosage: '', frequency: '', duration: '', instructions: '', quantity: 1, unit: 'tablets', beforeMeal: false, afterMeal: false }]
    }));
  };
  
  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      setFormData(prev => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index)
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.patient) newErrors.patient = 'Patient is required';
    if (!formData.diagnosis) newErrors.diagnosis = 'Diagnosis is required';
    formData.medications.forEach((med, index) => {
      if (!med.drug) newErrors[`medication_${index}_drug`] = 'Drug is required';
      if (!med.dosage) newErrors[`medication_${index}_dosage`] = 'Dosage is required';
      if (!med.frequency) newErrors[`medication_${index}_frequency`] = 'Frequency is required';
      if (!med.duration) newErrors[`medication_${index}_duration`] = 'Duration is required';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const cleanMedications = formData.medications.filter(med => med.drug && med.dosage && med.frequency && med.duration);
      const prescriptionData = { ...formData, medications: cleanMedications };
      await onEdit(prescription._id, prescriptionData);
    } catch (err) {
      console.error('Error updating prescription:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setErrors({});
    onClose();
  };
  
  const getDrugDisplayName = (drugId) => {
    const drug = drugs.find(d => d._id === drugId);
    if (!drug) return '';
    return `${drug.name} ${drug.strength} (${drug.form})`;
  };
  
  const getSelectedPatientName = () => {
    const patient = patients.find(p => p._id === formData.patient);
    return patient ? patient.name : '';
  };
  
  const formatAppointmentDisplay = (appointment) => {
    try {
      const date = new Date(appointment.appointmentDate);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${dateStr} at ${timeStr} (${appointment.duration} min)`;
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  if (!prescription) return null;
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PharmacyIcon color="primary" />
          Edit Prescription: {prescription.prescriptionNumber}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Basic Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.patient}>
              <InputLabel>Patient *</InputLabel>
              <Select
                value={formData.patient}
                onChange={(e) => handleInputChange('patient', e.target.value)}
                label="Patient *"
                disabled={loadingPatients}
                renderValue={(value) => {
                  const p = patients.find(pt => pt._id === value);
                  return p ? `${p.name} (ID: ${p.patientId || p._id.slice(-6)})` : '';
                }}
              >
                {loadingPatients ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading patients...
                  </MenuItem>
                ) : patients.length > 0 ? (
                  patients.map((patient) => (
                    <MenuItem key={patient._id} value={patient._id}>
                      {patient.name} (ID: {patient.patientId || patient._id.slice(-6)})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No patients available</MenuItem>
                )}
              </Select>
              {errors.patient && (
                <Typography variant="caption" color="error">
                  {errors.patient}
                </Typography>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>
                {formData.patient ? `Appointment for ${getSelectedPatientName()}` : 'Appointment (Optional)'}
              </InputLabel>
              <Select
                value={formData.appointment}
                onChange={(e) => handleInputChange('appointment', e.target.value)}
                label={formData.patient ? `Appointment for ${getSelectedPatientName()}` : 'Appointment (Optional)'}
                disabled={loadingAppointments || !formData.patient}
                renderValue={(value) => {
                  const a = appointments.find(ap => ap._id === value);
                  return a ? formatAppointmentDisplay(a) : '';
                }}
              >
                <MenuItem value="">
                  <em>No appointment</em>
                </MenuItem>
                {loadingAppointments ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading appointments...
                  </MenuItem>
                ) : appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <MenuItem key={appointment._id} value={appointment._id}>
                      {formatAppointmentDisplay(appointment)}
                    </MenuItem>
                  ))
                ) : formData.patient ? (
                  <MenuItem disabled>No appointments for this patient</MenuItem>
                ) : (
                  <MenuItem disabled>Select a patient first</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Diagnosis */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Diagnosis *"
              value={formData.diagnosis}
              onChange={(e) => handleInputChange('diagnosis', e.target.value)}
              error={!!errors.diagnosis}
              helperText={errors.diagnosis}
              placeholder="Enter patient diagnosis"
            />
          </Grid>

          {/* Medications */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">
                Medications
              </Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addMedication}>Add Medication</Button>
            </Box>

            {formData.medications.map((medication, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" color="primary">Medication {index + 1}</Typography>
                  {formData.medications.length > 1 && (
                    <IconButton color="error" onClick={() => removeMedication(index)}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors[`medication_${index}_drug`]}>
                      <InputLabel>Drug *</InputLabel>
                      <Select value={medication.drug} onChange={(e) => handleMedicationChange(index, 'drug', e.target.value)} label="Drug *">
                        {drugs.map((drug) => (
                          <MenuItem key={drug._id} value={drug._id}>
                            {drug.name} {drug.strength} ({drug.form})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors[`medication_${index}_drug`] && (
                        <Typography variant="caption" color="error">{errors[`medication_${index}_drug`]}</Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Dosage *" value={medication.dosage} onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)} error={!!errors[`medication_${index}_dosage`]} helperText={errors[`medication_${index}_dosage`]} placeholder="e.g., 1 tablet, 5ml" />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Frequency *" value={medication.frequency} onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)} error={!!errors[`medication_${index}_frequency`]} helperText={errors[`medication_${index}_frequency`]} placeholder="e.g., Twice daily, Every 8 hours" />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Duration *" value={medication.duration} onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)} error={!!errors[`medication_${index}_duration`]} helperText={errors[`medication_${index}_duration`]} placeholder="e.g., 7 days, 2 weeks" />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Quantity" type="number" value={medication.quantity} onChange={(e) => handleMedicationChange(index, 'quantity', parseInt(e.target.value) || 1)} inputProps={{ min: 1 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Unit</InputLabel>
                      <Select value={medication.unit} onChange={(e) => handleMedicationChange(index, 'unit', e.target.value)} label="Unit">
                        <MenuItem value="tablets">Tablets</MenuItem>
                        <MenuItem value="capsules">Capsules</MenuItem>
                        <MenuItem value="ml">ml</MenuItem>
                        <MenuItem value="mg">mg</MenuItem>
                        <MenuItem value="units">Units</MenuItem>
                        <MenuItem value="puffs">Puffs</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField fullWidth multiline rows={2} label="Special Instructions" value={medication.instructions} onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)} placeholder="Any special instructions for this medication" />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControlLabel control={<Switch checked={medication.beforeMeal} onChange={(e) => handleMedicationChange(index, 'beforeMeal', e.target.checked)} />} label="Take before meal" />
                      <FormControlLabel control={<Switch checked={medication.afterMeal} onChange={(e) => handleMedicationChange(index, 'afterMeal', e.target.checked)} />} label="Take after meal" />
                    </Box>
                  </Grid>
                </Grid>

                {medication.drug && (
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Selected: {getDrugDisplayName(medication.drug)}</Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Grid>

          {/* General Instructions */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">General Instructions</Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth multiline rows={3} label="General Instructions" value={formData.instructions} onChange={(e) => handleInputChange('instructions', e.target.value)} placeholder="General instructions for the patient" />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label="Follow-up Date" value={formData.followUpDate} onChange={(e) => handleInputChange('followUpDate', e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth multiline rows={2} label="Notes" value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Additional notes or comments" />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Updating...' : 'Update Prescription'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPrescription;
