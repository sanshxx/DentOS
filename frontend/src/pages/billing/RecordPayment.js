import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Button, Grid, TextField,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
  InputAdornment, IconButton
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RecordPayment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [invoice, setInvoice] = useState(null);
  
  const [paymentData, setPaymentData] = useState({
    date: new Date(),
    amount: 0,
    method: 'Cash',
    reference: '',
    notes: ''
  });
  
  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await axios.get(`${API_URL}/billing/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const invoice = response.data.data;
        
        // Calculate balance due if not provided directly from API
        const balanceDue = invoice.totalAmount - (invoice.amountPaid || 0);
        invoice.balanceDue = balanceDue;
        
        setInvoice(invoice);
        setPaymentData(prev => ({
          ...prev,
          amount: balanceDue
        }));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Error fetching invoice. Please try again.');
        setLoading(false);
      }
    };
    
    fetchInvoice();
  }, [id]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDateChange = (date) => {
    setPaymentData(prev => ({
      ...prev,
      date
    }));
  };
  
  const handleAmountChange = (e) => {
    const amount = parseFloat(e.target.value) || 0;
    setPaymentData(prev => ({
      ...prev,
      amount: Math.min(amount, invoice?.balanceDue || 0)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    // Validate form
    if (paymentData.amount <= 0) {
      setError('Payment amount must be greater than zero');
      setSubmitting(false);
      return;
    }
    
    if (paymentData.amount > invoice.balanceDue) {
      setError('Payment amount cannot exceed the balance due');
      setSubmitting(false);
      return;
    }
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_URL}/billing/${id}/payment`, {
        amount: paymentData.amount,
        paymentDate: paymentData.date,
        paymentMethod: paymentData.method,
        reference: paymentData.reference,
        notes: paymentData.notes
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess(true);
      
      // Redirect to invoice view after a delay
      setTimeout(() => {
        navigate(`/billing/invoice/${id}`);
      }, 2000);
    } catch (err) {
      console.error('Error recording payment:', err);
      const errorMessage = err.response?.data?.message || 'Error recording payment. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
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
  
  if (!invoice) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="warning">Invoice not found.</Alert>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
            <IconButton onClick={() => navigate(`/billing/invoice/${id}`)}>
              <ArrowBackIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h4" component="h1">
              Record Payment
            </Typography>
          </Grid>
        </Grid>
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Payment recorded successfully!
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">
                Invoice: {invoice.invoiceNumber}
              </Typography>
              <Typography variant="body2">
                Patient: {invoice.patient.name}
              </Typography>
              <Typography variant="body2">
                Clinic: {invoice.clinic.name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
              <Typography variant="subtitle1">
                Total Amount: {formatCurrency(invoice.totalAmount)}
              </Typography>
              <Typography variant="body2">
                Amount Paid: {formatCurrency(invoice.totalAmount - invoice.balanceDue)}
              </Typography>
              <Typography variant="subtitle1" color="primary">
                Balance Due: {formatCurrency(invoice.balanceDue)}
              </Typography>
            </Grid>
          </Grid>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Payment Date"
                    value={paymentData.date}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Amount"
                  name="amount"
                  type="number"
                  value={paymentData.amount}
                  onChange={handleAmountChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  helperText={`Maximum: ${formatCurrency(invoice.balanceDue)}`}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="payment-method-label">Payment Method</InputLabel>
                  <Select
                    labelId="payment-method-label"
                    name="method"
                    value={paymentData.method}
                    onChange={handleInputChange}
                    label="Payment Method"
                  >
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Credit Card">Credit Card</MenuItem>
                    <MenuItem value="Debit Card">Debit Card</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    <MenuItem value="Cheque">Cheque</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Reference Number"
                  name="reference"
                  value={paymentData.reference}
                  onChange={handleInputChange}
                  fullWidth
                  helperText="Transaction ID, Cheque Number, etc."
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  name="notes"
                  value={paymentData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => navigate(`/billing/invoice/${id}`)}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Recording...' : 'Record Payment'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default RecordPayment;