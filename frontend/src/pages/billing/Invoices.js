import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Box, Button, Grid, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, Chip, IconButton, TextField,
  InputAdornment, MenuItem, Select, FormControl, InputLabel, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PaymentIcon from '@mui/icons-material/Payment';
import axios from 'axios';
import { printInvoice, downloadInvoicePDF, downloadInvoiceCSV } from '../../utils/invoiceUtils';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_URL}/billing`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setInvoices(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Error fetching invoices. Please try again.');
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleCreateInvoice = () => {
          navigate('/billing/create');
  };

  const handleViewInvoice = (id) => {
    navigate(`/billing/invoice/${id}`);
  };

  const handleEditInvoice = (id) => {
    navigate(`/billing/invoice/${id}/edit`);
  };

  const handleDeleteInvoice = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        // Clear any previous errors
        setError(null);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        await axios.delete(`${API_URL}/billing/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Show success message
        alert('Invoice deleted successfully!');
        
        // Refresh the list after successful deletion
        fetchInvoices();
      } catch (err) {
        console.error('Error deleting invoice:', err);
        const errorMessage = err.response?.data?.message || 'Error deleting invoice. Please try again.';
        setError(errorMessage);
      }
    }
  };

  const handlePrintInvoice = async (id) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch the specific invoice data
      const response = await axios.get(`${API_URL}/billing/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const invoice = response.data.data;
      await printInvoice(invoice);
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Failed to print invoice. Please try again.');
    }
  };

  const [downloadDialog, setDownloadDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleDownloadInvoice = async (id) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch the specific invoice data
      const response = await axios.get(`${API_URL}/billing/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const invoice = response.data.data;
      setSelectedInvoice(invoice);
      setDownloadDialog(true);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const handleDownloadFormat = async (format) => {
    try {
      if (format === 'pdf') {
        await downloadInvoicePDF(selectedInvoice);
      } else {
        downloadInvoiceCSV(selectedInvoice);
      }
      setDownloadDialog(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const handleRecordPayment = (id) => {
    navigate(`/billing/invoice/${id}/payment`);
  };

  // Filter invoices based on search term and status filter
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      invoice.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Paginate the filtered invoices
  const paginatedInvoices = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status chip color
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partially paid':
        return 'warning';
      case 'unpaid':
        return 'default';
      case 'overdue':
        return 'error';
      case 'cancelled':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1">
              Invoices
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateInvoice}
            >
              Create Invoice
            </Button>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by invoice number or patient name"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="status-filter-label">Payment Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Payment Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="partially paid">Partially Paid</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {loading ? (
            <Typography>Loading invoices...</Typography>
          ) : error ? (
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedInvoices.length > 0 ? (
                      paginatedInvoices.map((invoice) => (
                        <TableRow key={invoice._id}>
                          <TableCell>{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.patient.name}</TableCell>
                          <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                          <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                          <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1)} 
                              color={getStatusChipColor(invoice.paymentStatus)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => handleViewInvoice(invoice._id)}
                              title="View"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => handleEditInvoice(invoice._id)}
                              title="Edit"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => handlePrintInvoice(invoice._id)}
                              title="Print"
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => handleDownloadInvoice(invoice._id)}
                              title="Download"
                            >
                              <FileDownloadIcon fontSize="small" />
                            </IconButton>
                            {invoice.paymentStatus !== 'paid' && (
                              <IconButton 
                                size="small" 
                                color="success" 
                                onClick={() => handleRecordPayment(invoice._id)}
                                title="Record Payment"
                              >
                                <PaymentIcon fontSize="small" />
                              </IconButton>
                            )}
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleDeleteInvoice(invoice._id)}
                              title="Delete"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No invoices found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredInvoices.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Paper>
      </Box>

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
    </Container>
  );
};

export default Invoices;