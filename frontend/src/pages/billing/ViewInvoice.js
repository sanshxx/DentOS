import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Button, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, CircularProgress, Alert, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, Snackbar, InputAdornment
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import PaymentIcon from '@mui/icons-material/Payment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { formatAddress } from '../../utils/addressFormatter';
import { printInvoice, downloadInvoicePDF, downloadInvoiceCSV } from '../../utils/invoiceUtils';

// Get API URL from environment variables
import { API_URL } from '../../utils/apiConfig';

const ViewInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'cash',
    reference: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [editPaymentDialog, setEditPaymentDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editPaymentData, setEditPaymentData] = useState({
    amount: 0,
    method: 'cash',
    reference: '',
    notes: ''
  });
  const [downloadDialog, setDownloadDialog] = useState(false);
  
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
        
        setInvoice(response.data.data);
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
  
  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Partial':
        return 'warning';
      case 'Overdue':
        return 'error';
      case 'Pending':
        return 'info';
      default:
        return 'default';
    }
  };
  
  const handlePrint = async () => {
    try {
      await printInvoice(invoice);
    } catch (error) {
      console.error('Error printing invoice:', error);
      setNotification({
        open: true,
        message: 'Failed to print invoice. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleDownload = async () => {
    setDownloadDialog(true);
  };

  const handleDownloadFormat = async (format) => {
    try {
      if (format === 'pdf') {
        await downloadInvoicePDF(invoice);
      } else {
        downloadInvoiceCSV(invoice);
      }
      setDownloadDialog(false);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setNotification({
        open: true,
        message: 'Failed to download invoice. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleSendEmail = () => {
    // In a real app, we would send an email with the invoice
    alert('Email functionality will be implemented in the future.');
  };
  
  const handleRecordPayment = () => {
    setPaymentData({
      amount: invoice.balanceAmount || invoice.totalAmount,
      method: 'cash',
      reference: '',
      notes: ''
    });
    setPaymentDialog(true);
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSubmit = async () => {
    if (paymentData.amount <= 0) {
      setNotification({
        open: true,
        message: 'Payment amount must be greater than zero',
        severity: 'error'
      });
      return;
    }

    if (paymentData.amount > (invoice.balanceAmount || invoice.totalAmount)) {
      setNotification({
        open: true,
        message: 'Payment amount cannot exceed the balance due',
        severity: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_URL}/billing/${id}/payment`, {
        amount: paymentData.amount,
        paymentMethod: paymentData.method,
        reference: paymentData.reference,
        notes: paymentData.notes
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotification({
        open: true,
        message: 'Payment recorded successfully!',
        severity: 'success'
      });

      // Refresh invoice data
      const updatedResponse = await axios.get(`${API_URL}/billing/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setInvoice(updatedResponse.data.data);

      setPaymentDialog(false);
    } catch (err) {
      console.error('Error recording payment:', err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Error recording payment. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setEditPaymentData({
      amount: payment.amount,
      method: payment.paymentMethod || 'cash',
      reference: payment.transactionId || '',
      notes: payment.notes || ''
    });
    setEditPaymentDialog(true);
  };

  const handleDeletePayment = async (payment) => {
    if (!window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.delete(`${API_URL}/billing/${id}/payment/${payment._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotification({
        open: true,
        message: 'Payment deleted successfully!',
        severity: 'success'
      });

      // Refresh invoice data
      const updatedResponse = await axios.get(`${API_URL}/billing/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setInvoice(updatedResponse.data.data);
    } catch (err) {
      console.error('Error deleting payment:', err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Error deleting payment. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleEditPaymentInputChange = (e) => {
    const { name, value } = e.target;
    setEditPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditPaymentSubmit = async () => {
    if (editPaymentData.amount <= 0) {
      setNotification({
        open: true,
        message: 'Payment amount must be greater than zero',
        severity: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.put(`${API_URL}/billing/${id}/payment/${editingPayment._id}`, {
        amount: editPaymentData.amount,
        paymentMethod: editPaymentData.method,
        reference: editPaymentData.reference,
        notes: editPaymentData.notes
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotification({
        open: true,
        message: 'Payment updated successfully!',
        severity: 'success'
      });

      // Refresh invoice data
      const updatedResponse = await axios.get(`${API_URL}/billing/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setInvoice(updatedResponse.data.data);

      setEditPaymentDialog(false);
    } catch (err) {
      console.error('Error updating payment:', err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Error updating payment. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/billing/invoice/${id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      const deleteInvoice = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          await axios.delete(`${API_URL}/billing/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          alert('Invoice deleted successfully');
          navigate('/billing');
        } catch (err) {
          console.error('Error deleting invoice:', err);
          alert('Error deleting invoice. Please try again.');
        }
      };

      deleteInvoice();
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
    <Container maxWidth="lg" className="invoice-container">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
                          <IconButton onClick={() => navigate('/billing')}>
              <ArrowBackIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h4" component="h1">
              Invoice #{invoice.invoiceNumber}
            </Typography>
          </Grid>
          <Grid item>
            <Chip 
              label={invoice.paymentStatus} 
              color={getStatusColor(invoice.paymentStatus)} 
              sx={{ ml: 2 }}
            />
          </Grid>
          <Grid item sx={{ flexGrow: 1 }} />
          <Grid item>
            <Button 
              startIcon={<PrintIcon />} 
              variant="outlined" 
              onClick={handlePrint}
              sx={{ mr: 1 }}
            >
              Print
            </Button>
          </Grid>
          <Grid item>
            <Button 
              startIcon={<DownloadIcon />} 
              variant="outlined" 
              onClick={handleDownload}
              sx={{ mr: 1 }}
            >
              Download
            </Button>
          </Grid>
                     <Grid item>
             <Button 
               startIcon={<EmailIcon />} 
               variant="outlined" 
               onClick={handleSendEmail}
               sx={{ mr: 1 }}
             >
               Email
             </Button>
           </Grid>
           <Grid item>
             <Button 
               startIcon={<EditIcon />} 
               variant="outlined" 
               onClick={handleEdit}
               sx={{ mr: 1 }}
             >
               Edit
             </Button>
           </Grid>
           <Grid item>
             <Button 
               startIcon={<DeleteIcon />} 
               variant="outlined" 
               color="error" 
               onClick={handleDelete}
               sx={{ mr: 1 }}
             >
               Delete
             </Button>
           </Grid>
           {invoice.paymentStatus !== 'Paid' && (
             <Grid item>
               <Button 
                 startIcon={<PaymentIcon />} 
                 variant="contained" 
                 color="primary" 
                 onClick={handleRecordPayment}
               >
                 Record Payment
               </Button>
             </Grid>
           )}
        </Grid>
        
        <Paper sx={{ p: 4, mb: 3 }} className="invoice-paper">
          {/* Invoice Header */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                From
              </Typography>
              <Typography variant="body1">
                {invoice.clinic.name}
              </Typography>
              <Typography variant="body2">
                {formatAddress(invoice.clinic.address)}
              </Typography>
              <Typography variant="body2">
                Phone: {invoice.clinic.phone}
              </Typography>
              {invoice.isGstInvoice && (
                <Typography variant="body2">
                  GST: {invoice.gstDetails.gstNumber}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
              <Typography variant="h6" gutterBottom>
                To
              </Typography>
              <Typography variant="body1">
                {invoice.patient.name}
              </Typography>
              <Typography variant="body2">
                {formatAddress(invoice.patient.address)}
              </Typography>
              <Typography variant="body2">
                Phone: {invoice.patient.phone}
              </Typography>
              <Typography variant="body2">
                Email: {invoice.patient.email}
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Invoice Details */}
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Invoice Number
              </Typography>
              <Typography variant="body1">
                {invoice.invoiceNumber}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Invoice Date
              </Typography>
              <Typography variant="body1">
                {formatDate(invoice.invoiceDate)}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Due Date
              </Typography>
              <Typography variant="body1">
                {formatDate(invoice.dueDate)}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Status
              </Typography>
              <Chip 
                label={invoice.paymentStatus} 
                color={getStatusColor(invoice.paymentStatus)} 
                size="small"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Items
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Discount</TableCell>
                    <TableCell align="right">Tax</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right">{item.discount}%</TableCell>
                      <TableCell align="right">{item.tax}%</TableCell>
                      <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          
          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              {invoice.notes && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body2">
                    {invoice.notes}
                  </Typography>
                </Box>
              )}
              
              <Typography variant="subtitle2" gutterBottom>
                Terms and Conditions
              </Typography>
              <Typography variant="body2">
                {invoice.termsAndConditions}
              </Typography>
              
              {invoice.isGstInvoice && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    GST Details
                  </Typography>
                  <Typography variant="body2">
                    HSN/SAC: {invoice.gstDetails.hsnCode}
                  </Typography>
                  <Typography variant="body2">
                    CGST: {invoice.gstDetails.cgst}% | SGST: {invoice.gstDetails.sgst}% | IGST: {invoice.gstDetails.igst}%
                  </Typography>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Subtotal:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {formatCurrency(invoice.subtotal)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Discount:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {formatCurrency(invoice.discountAmount)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Tax:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {formatCurrency(invoice.taxAmount)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {formatCurrency(invoice.totalAmount)}
                    </Typography>
                  </Grid>
                  
                                     <Grid item xs={6}>
                     <Typography variant="body2">
                       Amount Paid:
                     </Typography>
                   </Grid>
                   <Grid item xs={6} sx={{ textAlign: 'right' }}>
                     <Typography variant="body2">
                       {formatCurrency(invoice.amountPaid || 0)}
                     </Typography>
                   </Grid>
                   
                   <Grid item xs={6}>
                     <Typography variant="body2" fontWeight="bold">
                       Balance Due:
                     </Typography>
                   </Grid>
                   <Grid item xs={6} sx={{ textAlign: 'right' }}>
                     <Typography variant="body2" fontWeight="bold">
                       {formatCurrency(invoice.balanceAmount || invoice.totalAmount)}
                     </Typography>
                   </Grid>
                </Grid>
              </Box>
              
                             {(invoice.payments && invoice.payments.length > 0) && (
                 <Box sx={{ mt: 3 }}>
                   <Typography variant="subtitle2" gutterBottom>
                     Payment History
                   </Typography>
                   <TableContainer>
                     <Table size="small">
                                               <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Method</TableCell>
                            <TableCell>Reference</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {invoice.payments.map((payment, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(payment.paymentDate || payment.date)}</TableCell>
                              <TableCell>{payment.paymentMethod || payment.method}</TableCell>
                              <TableCell>{payment.transactionId || payment.reference}</TableCell>
                              <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                              <TableCell align="center">
                                <IconButton 
                                  size="small" 
                                  color="primary" 
                                  onClick={() => handleEditPayment(payment)}
                                  title="Edit Payment"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => handleDeletePayment(payment)}
                                  title="Delete Payment"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                     </Table>
                   </TableContainer>
                 </Box>
               )}
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Invoice: {invoice?.invoiceNumber} | Balance Due: {formatCurrency(invoice?.balanceAmount || invoice?.totalAmount || 0)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Amount *"
                type="number"
                name="amount"
                value={paymentData.amount}
                onChange={handlePaymentInputChange}
                inputProps={{ min: 0, max: invoice?.balanceAmount || invoice?.totalAmount, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Method *</InputLabel>
                <Select
                  name="method"
                  value={paymentData.method}
                  label="Payment Method *"
                  onChange={handlePaymentInputChange}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="credit card">Credit Card</MenuItem>
                  <MenuItem value="debit card">Debit Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="bank transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                  <MenuItem value="insurance">Insurance</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference Number"
                name="reference"
                value={paymentData.reference}
                onChange={handlePaymentInputChange}
                placeholder="Transaction ID, Cheque Number, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={paymentData.notes}
                onChange={handlePaymentInputChange}
                multiline
                rows={2}
                placeholder="Additional notes about this payment"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handlePaymentSubmit} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? 'Recording...' : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Edit Dialog */}
      <Dialog open={editPaymentDialog} onClose={() => setEditPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Invoice: {invoice?.invoiceNumber} | Original Amount: {formatCurrency(editingPayment?.amount || 0)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Amount *"
                type="number"
                name="amount"
                value={editPaymentData.amount}
                onChange={handleEditPaymentInputChange}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Method *</InputLabel>
                <Select
                  name="method"
                  value={editPaymentData.method}
                  label="Payment Method *"
                  onChange={handleEditPaymentInputChange}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="credit card">Credit Card</MenuItem>
                  <MenuItem value="debit card">Debit Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="bank transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                  <MenuItem value="insurance">Insurance</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference Number"
                name="reference"
                value={editPaymentData.reference}
                onChange={handleEditPaymentInputChange}
                placeholder="Transaction ID, Cheque Number, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={editPaymentData.notes}
                onChange={handleEditPaymentInputChange}
                multiline
                rows={2}
                placeholder="Additional notes about this payment"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPaymentDialog(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleEditPaymentSubmit} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Payment'}
          </Button>
        </DialogActions>
             </Dialog>

       {/* Download Format Dialog */}
       <Dialog open={downloadDialog} onClose={() => setDownloadDialog(false)} maxWidth="sm" fullWidth>
         <DialogTitle>Choose Download Format</DialogTitle>
         <DialogContent>
           <Typography variant="body1" sx={{ mb: 2 }}>
             Select the format you would like to download the invoice:
           </Typography>
           <Grid container spacing={2}>
             <Grid item xs={6}>
               <Button
                 fullWidth
                 variant="outlined"
                 size="large"
                 onClick={() => handleDownloadFormat('pdf')}
                 sx={{ 
                   height: 80, 
                   flexDirection: 'column',
                   border: '2px solid #1976d2',
                   '&:hover': { border: '2px solid #1565c0' }
                 }}
               >
                 <Typography variant="h6" color="primary">PDF</Typography>
                 <Typography variant="body2" color="text.secondary">
                   Professional format
                 </Typography>
               </Button>
             </Grid>
             <Grid item xs={6}>
               <Button
                 fullWidth
                 variant="outlined"
                 size="large"
                 onClick={() => handleDownloadFormat('csv')}
                 sx={{ 
                   height: 80, 
                   flexDirection: 'column',
                   border: '2px solid #2e7d32',
                   '&:hover': { border: '2px solid #1b5e20' }
                 }}
               >
                 <Typography variant="h6" color="success.main">CSV</Typography>
                 <Typography variant="body2" color="text.secondary">
                   Data analysis
                 </Typography>
               </Button>
             </Grid>
           </Grid>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setDownloadDialog(false)}>
             Cancel
           </Button>
         </DialogActions>
       </Dialog>
 
       {/* Notification Snackbar */}
       <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ViewInvoice;