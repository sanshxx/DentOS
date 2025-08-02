import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Grid, Divider, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, List, ListItem, ListItemText, IconButton,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, MenuItem, Select, FormControl, InputLabel, Alert, Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Print as PrintIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  MoneyOff as MoneyOffIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  LocalOffer as LocalOfferIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon
} from '@mui/icons-material';

const InvoiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', action: null });

  useEffect(() => {
    // In a real app, we would fetch the invoice data from an API
    // For now, we'll simulate a delay and use mock data
    const timer = setTimeout(() => {
      setInvoice({
        id: id,
        invoiceNumber: 'INV-2023-' + id,
        date: '2023-11-15',
        dueDate: '2023-12-15',
        status: 'pending',
        patient: {
          id: '123',
          name: 'Rahul Sharma',
          email: 'rahul.sharma@example.com',
          phone: '+91 98765 43210',
          address: '42 Park Street, Mumbai, Maharashtra 400001'
        },
        doctor: {
          id: '456',
          name: 'Dr. Priya Patel',
          specialization: 'Orthodontist'
        },
        clinic: {
          id: '789',
          name: 'Smile Dental Care - Mumbai Central',
          address: '123 Healthcare Avenue, Mumbai, Maharashtra 400001',
          phone: '+91 22 2345 6789',
          email: 'mumbai@smiledentalcare.com',
          gstNumber: 'GST1234567890'
        },
        items: [
          {
            id: '1',
            description: 'Dental Consultation',
            quantity: 1,
            unitPrice: 500,
            discount: 0,
            tax: 18,
            total: 590
          },
          {
            id: '2',
            description: 'Dental X-Ray (Full Mouth)',
            quantity: 1,
            unitPrice: 1200,
            discount: 0,
            tax: 18,
            total: 1416
          },
          {
            id: '3',
            description: 'Root Canal Treatment',
            quantity: 1,
            unitPrice: 8000,
            discount: 500,
            tax: 18,
            total: 8850
          }
        ],
        subtotal: 9700,
        discount: 500,
        tax: 1656,
        total: 10856,
        amountPaid: 2000,
        balanceDue: 8856,
        paymentHistory: [
          {
            id: 'p1',
            date: '2023-11-15',
            amount: 2000,
            method: 'Card',
            reference: 'CARD-1234'
          }
        ],
        notes: 'Please pay within 30 days. Late payments will incur a 2% interest charge.',
        terms: 'All services are non-refundable. Rescheduling requires 24 hours notice.',
        treatmentDetails: {
          treatmentId: 't123',
          treatmentName: 'Root Canal and Crown',
          startDate: '2023-11-10',
          endDate: '2023-11-15',
          sessions: 2
        }
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  const handlePrint = () => {
    // In a real app, we would implement print functionality
    // For now, we'll just show a notification
    setNotification({
      open: true,
      message: 'Invoice sent to printer',
      severity: 'success'
    });
  };

  const handleDownload = () => {
    // In a real app, we would implement download functionality
    // For now, we'll just show a notification
    setNotification({
      open: true,
      message: 'Invoice downloaded successfully',
      severity: 'success'
    });
  };

  const handleSendEmail = () => {
    // In a real app, we would implement email functionality
    // For now, we'll just show a notification
    setNotification({
      open: true,
      message: 'Invoice sent to patient via email',
      severity: 'success'
    });
  };

  const handleSendSMS = () => {
    // In a real app, we would implement SMS functionality
    // For now, we'll just show a notification
    setNotification({
      open: true,
      message: 'Payment reminder sent to patient via SMS',
      severity: 'success'
    });
  };

  const handleEdit = () => {
    navigate(`/invoices/edit/${id}`);
  };

  const handleDelete = () => {
    setConfirmDialog({
      open: true,
      title: 'Delete Invoice',
      message: 'Are you sure you want to delete this invoice? This action cannot be undone.',
      action: () => {
        // In a real app, we would call the API to delete the invoice
        // For now, we'll just show a notification and navigate back
        setNotification({
          open: true,
          message: 'Invoice deleted successfully',
          severity: 'success'
        });
        navigate('/invoices');
      }
    });
  };

  const handleOpenPaymentDialog = () => {
    setPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialog(false);
  };

  const handleAddPayment = () => {
    // Validate payment amount
    if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
      setNotification({
        open: true,
        message: 'Please enter a valid payment amount',
        severity: 'error'
      });
      return;
    }

    // In a real app, we would call the API to add the payment
    // For now, we'll just update the local state
    const amount = parseFloat(paymentAmount);
    const newPayment = {
      id: 'p' + (invoice.paymentHistory.length + 1),
      date: new Date().toISOString().split('T')[0],
      amount: amount,
      method: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1),
      reference: paymentMethod.toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)
    };

    const updatedInvoice = {
      ...invoice,
      amountPaid: invoice.amountPaid + amount,
      balanceDue: invoice.balanceDue - amount,
      paymentHistory: [...invoice.paymentHistory, newPayment],
      status: invoice.balanceDue - amount <= 0 ? 'paid' : 'partial'
    };

    setInvoice(updatedInvoice);
    setNotification({
      open: true,
      message: 'Payment added successfully',
      severity: 'success'
    });
    handleClosePaymentDialog();
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const handleConfirmDialogConfirm = () => {
    if (confirmDialog.action) {
      confirmDialog.action();
    }
    handleConfirmDialogClose();
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'paid':
        return <Chip label="Paid" color="success" icon={<AttachMoneyIcon />} />;
      case 'partial':
        return <Chip label="Partially Paid" color="warning" icon={<AttachMoneyIcon />} />;
      case 'pending':
        return <Chip label="Pending" color="info" icon={<MoneyOffIcon />} />;
      case 'overdue':
        return <Chip label="Overdue" color="error" icon={<MoneyOffIcon />} />;
      default:
        return <Chip label={status} />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Loading Invoice Details...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Invoice #{invoice.invoiceNumber}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        </Box>

        {/* Invoice Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                From
              </Typography>
              <Typography variant="body1">{invoice.clinic.name}</Typography>
              <Typography variant="body2">{invoice.clinic.address}</Typography>
              <Typography variant="body2">Phone: {invoice.clinic.phone}</Typography>
              <Typography variant="body2">Email: {invoice.clinic.email}</Typography>
              <Typography variant="body2">GST: {invoice.clinic.gstNumber}</Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
              <Typography variant="h6" gutterBottom>
                To
              </Typography>
              <Typography variant="body1">{invoice.patient.name}</Typography>
              <Typography variant="body2">{invoice.patient.address}</Typography>
              <Typography variant="body2">Phone: {invoice.patient.phone}</Typography>
              <Typography variant="body2">Email: {invoice.patient.email}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Invoice Number
              </Typography>
              <Typography variant="body1">{invoice.invoiceNumber}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Invoice Date
              </Typography>
              <Typography variant="body1">{new Date(invoice.date).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Due Date
              </Typography>
              <Typography variant="body1">{new Date(invoice.dueDate).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              {getStatusChip(invoice.status)}
            </Grid>
          </Grid>
        </Paper>

        {/* Invoice Items */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Services & Products
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price (₹)</TableCell>
                  <TableCell align="right">Discount (₹)</TableCell>
                  <TableCell align="right">Tax (%)</TableCell>
                  <TableCell align="right">Total (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.discount.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.tax}%</TableCell>
                    <TableCell align="right">{item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Grid container spacing={1} sx={{ maxWidth: 400 }}>
              <Grid item xs={6}>
                <Typography variant="body1">Subtotal:</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body1">₹{invoice.subtotal.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Discount:</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body1">₹{invoice.discount.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Tax:</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body1">₹{invoice.tax.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">Total:</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="h6">₹{invoice.total.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Amount Paid:</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body1" color="success.main">₹{invoice.amountPaid.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" fontWeight="bold">Balance Due:</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body1" fontWeight="bold" color={invoice.balanceDue > 0 ? 'error.main' : 'success.main'}>
                  ₹{invoice.balanceDue.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Payment Information */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Payment History
                </Typography>
                {invoice.balanceDue > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<AttachMoneyIcon />}
                    onClick={handleOpenPaymentDialog}
                  >
                    Add Payment
                  </Button>
                )}
              </Box>
              {invoice.paymentHistory.length > 0 ? (
                <List>
                  {invoice.paymentHistory.map((payment) => (
                    <ListItem key={payment.id} divider>
                      <ListItemText
                        primary={`₹${payment.amount.toFixed(2)} - ${payment.method}`}
                        secondary={`Date: ${new Date(payment.date).toLocaleDateString()} | Reference: ${payment.reference}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No payments recorded yet.
                </Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Treatment Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Treatment"
                    secondary={invoice.treatmentDetails.treatmentName}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Treatment Period"
                    secondary={`${new Date(invoice.treatmentDetails.startDate).toLocaleDateString()} to ${new Date(invoice.treatmentDetails.endDate).toLocaleDateString()}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Sessions"
                    secondary={invoice.treatmentDetails.sessions}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Doctor"
                    secondary={`${invoice.doctor.name} (${invoice.doctor.specialization})`}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Notes and Terms */}
        <Paper elevation={3} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Typography variant="body2">{invoice.notes}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Terms & Conditions
              </Typography>
              <Typography variant="body2">{invoice.terms}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Action Buttons */}
        {invoice.balanceDue > 0 && (
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<EmailIcon />}
              onClick={handleSendEmail}
            >
              Send Invoice
            </Button>
            <Button
              variant="outlined"
              startIcon={<MessageIcon />}
              onClick={handleSendSMS}
            >
              Send Payment Reminder
            </Button>
          </Box>
        )}
      </Box>

      {/* Add Payment Dialog */}
      <Dialog open={paymentDialog} onClose={handleClosePaymentDialog}>
        <DialogTitle>Add Payment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter payment details for invoice #{invoice.invoiceNumber}.
            Current balance due: ₹{invoice.balanceDue.toFixed(2)}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Payment Amount (₹)"
            type="number"
            fullWidth
            variant="outlined"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            inputProps={{ min: 0, max: invoice.balanceDue, step: 0.01 }}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Credit/Debit Card</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
              <MenuItem value="netbanking">Net Banking</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog}>Cancel</Button>
          <Button onClick={handleAddPayment} variant="contained">
            Add Payment
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

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>Cancel</Button>
          <Button onClick={handleConfirmDialogConfirm} autoFocus color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InvoiceDetails;