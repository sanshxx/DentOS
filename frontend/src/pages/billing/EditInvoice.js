import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Button, Alert, CircularProgress,
  TextField, Grid, FormControl, InputLabel, Select, MenuItem,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { formatAddress } from '../../utils/addressFormatter';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EditInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Fetch invoice data
        const invoiceResponse = await axios.get(`${API_URL}/billing/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvoice(invoiceResponse.data.data);

        // Fetch patients, clinics, and treatments for dropdowns
        const [patientsRes, clinicsRes, treatmentsRes] = await Promise.all([
          axios.get(`${API_URL}/patients`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/clinics`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/treatments`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setPatients(patientsRes.data.data);
        setClinics(clinicsRes.data.data);
        setTreatments(treatmentsRes.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading invoice data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (field, value) => {
    setInvoice(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoice.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // Recalculate item total
    const item = updatedItems[index];
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discount / 100);
    const taxAmount = (subtotal - discountAmount) * (item.tax / 100);
    item.amount = subtotal - discountAmount + taxAmount;
    
    setInvoice(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    const newItem = {
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: 18,
      amount: 0
    };
    
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalDiscount = invoice.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * item.discount / 100);
    }, 0);
    const totalTax = invoice.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * item.discount / 100;
      return sum + ((itemSubtotal - itemDiscount) * item.tax / 100);
    }, 0);
    
    return {
      subtotal,
      discountAmount: totalDiscount,
      taxAmount: totalTax,
      totalAmount: subtotal - totalDiscount + totalTax
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const totals = calculateTotals();
      const updatedInvoice = {
        ...invoice,
        ...totals
      };

      await axios.put(`${API_URL}/billing/${id}`, updatedInvoice, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('Invoice updated successfully!');
      navigate(`/billing/invoice/${id}`);
    } catch (err) {
      console.error('Error updating invoice:', err);
      alert('Error updating invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  const totals = calculateTotals();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/billing/invoice/${id}`)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Edit Invoice #{invoice.invoiceNumber}
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Patient</InputLabel>
                  <Select
                    value={invoice.patient._id || ''}
                    label="Patient"
                    onChange={(e) => handleInputChange('patient', patients.find(p => p._id === e.target.value))}
                  >
                    {patients.map((patient) => (
                      <MenuItem key={patient._id} value={patient._id}>
                        {patient.name} - {patient.patientId}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Clinic</InputLabel>
                  <Select
                    value={invoice.clinic._id || ''}
                    label="Clinic"
                    onChange={(e) => handleInputChange('clinic', clinics.find(c => c._id === e.target.value))}
                  >
                    {clinics.map((clinic) => (
                      <MenuItem key={clinic._id} value={clinic._id}>
                        {clinic.name} - {clinic.branchCode}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Invoice Date"
                  type="date"
                  value={invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={invoice.dueDate ? invoice.dueDate.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {/* Invoice Items */}
            <Typography variant="h6" gutterBottom>
              Invoice Items
            </Typography>
            <TableContainer sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Discount (%)</TableCell>
                    <TableCell>Tax (%)</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          size="small"
                          inputProps={{ min: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                          size="small"
                          inputProps={{ min: 0, max: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.tax}
                          onChange={(e) => handleItemChange(index, 'tax', parseFloat(e.target.value) || 0)}
                          size="small"
                          inputProps={{ min: 0, max: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        ₹{item.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => removeItem(index)}
                          disabled={invoice.items.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addItem}
              sx={{ mb: 3 }}
            >
              Add Item
            </Button>

            {/* Totals */}
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">Subtotal:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">₹{totals.subtotal.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Discount:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">₹{totals.discountAmount.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Tax:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">₹{totals.taxAmount.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <hr />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6">Total:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="h6">₹{totals.totalAmount.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Notes */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={invoice.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Terms & Conditions"
                  multiline
                  rows={3}
                  value={invoice.termsAndConditions || ''}
                  onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/billing/invoice/${id}`)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditInvoice; 