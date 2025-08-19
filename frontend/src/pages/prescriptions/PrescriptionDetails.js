import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Chip,
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalPharmacy as PharmacyIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

const PrescriptionDetails = ({ open, prescription, onClose }) => {
  if (!prescription) return null;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PharmacyIcon color="primary" />
            <Typography variant="h5" component="h2">
              Prescription: {prescription.prescriptionNumber}
            </Typography>
          </Box>
          <Button
            icon={<CloseIcon />}
            onClick={onClose}
            sx={{ minWidth: 'auto' }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* Header Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon />
                    <Box>
                      <Typography variant="subtitle2">Patient</Typography>
                      <Typography variant="h6">
                        {prescription.patient?.name || 'Unknown Patient'}
                      </Typography>
                      {prescription.patient?.patientId && (
                        <Typography variant="caption">
                          ID: {prescription.patient.patientId}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon />
                    <Box>
                      <Typography variant="subtitle2">Doctor</Typography>
                      <Typography variant="h6">
                        Dr. {prescription.doctor?.name || 'Unknown Doctor'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon />
                    <Box>
                      <Typography variant="subtitle2">Date</Typography>
                      <Typography variant="h6">
                        {formatDate(prescription.date)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Status and Issuing Info */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary">
                  Status & Issuing Information
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                    color={getStatusColor(prescription.status)}
                  />
                  {prescription.isIssuedToPatient && (
                    <Chip
                      label="Issued to Patient"
                      color="success"
                      startIcon={<PharmacyIcon />}
                    />
                  )}
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                {prescription.isIssuedToPatient && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Issued Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(prescription.issuedToPatientDate)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Issued By
                      </Typography>
                      <Typography variant="body1">
                        {prescription.issuedBy?.name}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {prescription.followUpDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Follow-up Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(prescription.followUpDate)}
                    </Typography>
                  </Grid>
                )}
                
                {prescription.appointment && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Related Appointment
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(prescription.appointment?.appointmentDate)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
          
          {/* Diagnosis */}
          {prescription.diagnosis && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Diagnosis
                </Typography>
                <Typography variant="body1">
                  {prescription.diagnosis}
                </Typography>
              </Paper>
            </Grid>
          )}
          
          {/* Medications */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Medications ({prescription.medications?.length || 0})
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Drug</TableCell>
                      <TableCell>Dosage</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Instructions</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prescription.medications?.map((medication, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {medication.drug?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {medication.drug?.strength} ({medication.drug?.form})
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {medication.dosage}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {medication.frequency}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {medication.duration}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {medication.quantity} {medication.unit}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {medication.instructions && (
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {medication.instructions}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {medication.beforeMeal && (
                                <Chip label="Before Meal" size="small" color="warning" />
                              )}
                              {medication.afterMeal && (
                                <Chip label="After Meal" size="small" color="success" />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Chip
                              label={medication.isIssuedToPatient ? 'Issued' : 'Pending'}
                              color={medication.isIssuedToPatient ? 'success' : 'default'}
                              size="small"
                            />
                            {medication.isIssuedToPatient && (
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(medication.issuedToPatientDate)}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          {/* Instructions */}
          {prescription.instructions && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  General Instructions
                </Typography>
                <Typography variant="body1">
                  {prescription.instructions}
                </Typography>
              </Paper>
            </Grid>
          )}
          
          {/* Notes */}
          {prescription.notes && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Notes
                </Typography>
                <Typography variant="body1">
                  {prescription.notes}
                </Typography>
              </Paper>
            </Grid>
          )}
          
          {/* Metadata */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Metadata
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created By
                  </Typography>
                  <Typography variant="body1">
                    {prescription.createdBy?.firstName} {prescription.createdBy?.lastName}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created On
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(prescription.createdAt)}
                  </Typography>
                </Grid>
                
                {prescription.updatedBy && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Updated By
                      </Typography>
                      <Typography variant="body1">
                        {prescription.updatedBy.firstName} {prescription.updatedBy.lastName}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Updated On
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(prescription.updatedAt)}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrescriptionDetails;
