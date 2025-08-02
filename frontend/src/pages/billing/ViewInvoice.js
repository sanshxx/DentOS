import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Button, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, CircularProgress, Alert, IconButton
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import PaymentIcon from '@mui/icons-material/Payment';

const ViewInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoice, setInvoice] = useState(null);
  
  useEffect(() => {
    // In a real app, we would fetch from the API
    // For now, we'll simulate an API call with mock data
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      // Mock invoice data
      const mockInvoice = {
        _id: id,
        invoiceNumber: 'INV-2023-001',
        patient: {
          _id: '60d21b4667d0d8992e610c01',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '9876543210',
          address: '123 Main St, Anytown, AT 12345'
        },
        clinic: {
          _id: '60d21b4667d0d8992e610c10',
          name: 'Main Clinic',
          address: '456 Clinic Ave, Medical City, MC 67890',
          phone: '1234567890'
        },
        invoiceDate: new Date('2023-06-15'),
        dueDate: new Date('2023-07-15'),
        items: [
          {
            description: 'Dental Cleaning',
            quantity: 1,
            unitPrice: 2000,
            discount: 0,
            tax: 18,
            amount: 2360
          },
          {
            description: 'X-Ray',
            quantity: 2,
            unitPrice: 1500,
            discount: 10,
            tax: 18,
            amount: 3186
          }
        ],
        subtotal: 5000,
        discountAmount: 300,
        taxAmount: 846,
        totalAmount: 5546,
        paymentStatus: 'Paid',
        paymentHistory: [
          {
            date: new Date('2023-06-15'),
            amount: 5546,
            method: 'Credit Card',
            reference: 'TXREF123456'
          }
        ],
        notes: 'Patient reported sensitivity in upper right molar.',
        termsAndConditions: 'Payment is due within 30 days. Late payments are subject to a 2% monthly interest charge.',
        isGstInvoice: true,
        gstDetails: {
          gstNumber: 'GST123456789',
          cgst: 9,
          sgst: 9,
          igst: 0,
          hsnCode: '998313'
        },
        createdAt: new Date('2023-06-15'),
        updatedAt: new Date('2023-06-15')
      };
      
      setInvoice(mockInvoice);
      setLoading(false);
    }, 1000);
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
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = () => {
    // In a real app, we would generate a PDF and download it
    alert('PDF download functionality will be implemented in the future.');
  };
  
  const handleSendEmail = () => {
    // In a real app, we would send an email with the invoice
    alert('Email functionality will be implemented in the future.');
  };
  
  const handleRecordPayment = () => {
    // In a real app, we would navigate to a payment form
    navigate(`/billing/invoice/${id}/payment`);
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
                {invoice.clinic.address}
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
                {invoice.patient.address}
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
                      {formatCurrency(invoice.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0))}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="bold">
                      Balance Due:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(invoice.totalAmount - invoice.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0))}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              {invoice.paymentHistory.length > 0 && (
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
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoice.paymentHistory.map((payment, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(payment.date)}</TableCell>
                            <TableCell>{payment.method}</TableCell>
                            <TableCell>{payment.reference}</TableCell>
                            <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
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
    </Container>
  );
};

export default ViewInvoice;