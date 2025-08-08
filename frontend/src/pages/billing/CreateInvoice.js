import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Button, Grid, TextField,
  FormControl, InputLabel, Select, MenuItem, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, Autocomplete, InputAdornment, FormHelperText, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    patient: '',
    clinic: '',
    invoiceDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default due date: 30 days from now
    items: [
      { description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 18, amount: 0 }
    ],
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    notes: '',
    termsAndConditions: 'Payment is due within 30 days. Late payments are subject to a 2% monthly interest charge.',
    isGstInvoice: true,
    gstDetails: {
      gstNumber: 'GST123456789',
      cgst: 9,
      sgst: 9,
      igst: 0,
      hsnCode: '998313'
    }
  });
  
  // State for dropdown data
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [treatments, setTreatments] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Fetch patients
        const patientsResponse = await axios.get(`${API_URL}/patients`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPatients(patientsResponse.data.data);
        
        // Fetch clinics
        const clinicsResponse = await axios.get(`${API_URL}/clinics`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setClinics(clinicsResponse.data.data);
        
        // Fetch treatments
        const treatmentsResponse = await axios.get(`${API_URL}/treatments`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTreatments(treatmentsResponse.data.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data. Please try again.');
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate totals whenever items change
  useEffect(() => {
    calculateTotals();
  }, [formData.items]);
  
  const calculateTotals = () => {
    // Calculate subtotal (sum of all item amounts before tax)
    const subtotal = formData.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * (item.discount / 100);
      return sum + (itemSubtotal - itemDiscount);
    }, 0);
    
    // Calculate total discount amount
    const discountAmount = formData.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * item.discount / 100);
    }, 0);
    
    // Calculate total tax amount
    const taxAmount = formData.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * (item.discount / 100);
      const discountedAmount = itemSubtotal - itemDiscount;
      return sum + (discountedAmount * item.tax / 100);
    }, 0);
    
    // Calculate total amount (subtotal + tax)
    const totalAmount = subtotal + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount
    }));
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };
  
  const handlePatientChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      patient: newValue ? newValue._id : ''
    }));
  };
  
  const handleClinicChange = (event) => {
    setFormData(prev => ({
      ...prev,
      clinic: event.target.value
    }));
  };
  
  const handleGstToggle = (event) => {
    const isGst = event.target.value === 'true';
    setFormData(prev => ({
      ...prev,
      isGstInvoice: isGst
    }));
  };
  
  const handleGstDetailChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      gstDetails: {
        ...prev.gstDetails,
        [name]: value
      }
    }));
  };
  
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 18, amount: 0 }]
    }));
  };
  
  const handleRemoveItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };
  
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Calculate amount for this item (this is for display purposes only)
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount' || field === 'tax') {
      const item = newItems[index];
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * (item.discount / 100);
      const discountedAmount = itemSubtotal - itemDiscount;
      const itemTax = discountedAmount * (item.tax / 100);
      item.amount = discountedAmount + itemTax;
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };
  
  const handleTreatmentSelect = (index, treatmentId) => {
    const treatment = treatments.find(t => t._id === treatmentId);
    if (treatment) {
      const newItems = [...formData.items];
      newItems[index].description = treatment.name;
      newItems[index].unitPrice = treatment.price;
      
      // Recalculate amount
      const item = newItems[index];
      const discountedPrice = item.quantity * item.unitPrice * (1 - item.discount / 100);
      const taxAmount = discountedPrice * item.tax / 100;
      item.amount = discountedPrice + taxAmount;
      
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate form
    if (!formData.patient) {
      setError('Please select a patient');
      setLoading(false);
      return;
    }
    
    if (!formData.clinic) {
      setError('Please select a clinic');
      setLoading(false);
      return;
    }
    
    if (formData.items.length === 0) {
      setError('Please add at least one item');
      setLoading(false);
      return;
    }
    
    for (const item of formData.items) {
      if (!item.description || item.quantity <= 0 || item.unitPrice <= 0) {
        setError('Please fill in all item details correctly');
        setLoading(false);
        return;
      }
    }
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_URL}/billing`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Invoice created:', response.data);
      
      setSuccess(true);
      
      // Redirect to invoices list after a delay
      setTimeout(() => {
        navigate('/billing');
      }, 2000);
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
            <IconButton onClick={() => navigate('/billing')}>
              <ArrowBackIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h4" component="h1">
              Create Invoice
            </Typography>
          </Grid>
        </Grid>
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Invoice created successfully!
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Patient and Clinic Selection */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={patients}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Patient"
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                  onChange={handlePatientChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="clinic-label">Clinic</InputLabel>
                  <Select
                    labelId="clinic-label"
                    value={formData.clinic}
                    onChange={handleClinicChange}
                    label="Clinic"
                  >
                    {clinics.map(clinic => (
                      <MenuItem key={clinic._id} value={clinic._id}>
                        {clinic.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Invoice and Due Dates */}
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Invoice Date"
                    value={formData.invoiceDate}
                    onChange={(date) => handleDateChange('invoiceDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Due Date"
                    value={formData.dueDate}
                    onChange={(date) => handleDateChange('dueDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>
              
              {/* GST Invoice Toggle */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <Typography variant="subtitle1" gutterBottom>
                    GST Invoice
                  </Typography>
                  <Select
                    value={formData.isGstInvoice.toString()}
                    onChange={handleGstToggle}
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* GST Details */}
              {formData.isGstInvoice && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      GST Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="GST Number"
                          name="gstNumber"
                          value={formData.gstDetails.gstNumber}
                          onChange={handleGstDetailChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="HSN Code"
                          name="hsnCode"
                          value={formData.gstDetails.hsnCode}
                          onChange={handleGstDetailChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="CGST %"
                          name="cgst"
                          type="number"
                          value={formData.gstDetails.cgst}
                          onChange={handleGstDetailChange}
                          fullWidth
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="SGST %"
                          name="sgst"
                          type="number"
                          value={formData.gstDetails.sgst}
                          onChange={handleGstDetailChange}
                          fullWidth
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="IGST %"
                          name="igst"
                          type="number"
                          value={formData.gstDetails.igst}
                          onChange={handleGstDetailChange}
                          fullWidth
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
              
              {/* Invoice Items */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Invoice Items
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Discount %</TableCell>
                        <TableCell align="right">Tax %</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Grid container spacing={1}>
                              <Grid item xs={12}>
                                <TextField
                                  value={item.description}
                                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                  fullWidth
                                  placeholder="Item description"
                                  required
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <FormControl fullWidth size="small">
                                  <InputLabel id={`treatment-label-${index}`}>Select Treatment</InputLabel>
                                  <Select
                                    labelId={`treatment-label-${index}`}
                                    label="Select Treatment"
                                    onChange={(e) => handleTreatmentSelect(index, e.target.value)}
                                  >
                                    {treatments.map(treatment => (
                                      <MenuItem key={treatment._id} value={treatment._id}>
                                        {treatment.name} - {formatCurrency(treatment.price)}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                            </Grid>
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                              inputProps={{ min: 1 }}
                              required
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              }}
                              required
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={item.discount}
                              onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={item.tax}
                              onChange={(e) => handleItemChange(index, 'tax', parseFloat(e.target.value) || 0)}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.amount)}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveItem(index)}
                              disabled={formData.items.length === 1}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                    variant="outlined"
                  >
                    Add Item
                  </Button>
                </Box>
              </Grid>
              
              {/* Totals */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2} justifyContent="flex-end">
                  <Grid item xs={12} md={6}>
                    <Grid container>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1" align="right">
                          Subtotal:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1" align="right">
                          {formatCurrency(formData.subtotal)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1" align="right">
                          Discount:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1" align="right">
                          {formatCurrency(formData.discountAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1" align="right">
                          Tax:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1" align="right">
                          {formatCurrency(formData.taxAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h6" align="right">
                          Total:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h6" align="right">
                          {formatCurrency(formData.totalAmount)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              
              {/* Notes and Terms */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Terms and Conditions"
                  name="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  fullWidth
                />
              </Grid>
              
              {/* Submit Button */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => navigate('/billing')}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Invoice'}
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

export default CreateInvoice;