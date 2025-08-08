import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Grid, Divider, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, CircularProgress, IconButton, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, TextField, InputAdornment
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  History as HistoryIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const InventoryDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [item, setItem] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  
  // Dialog states
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [stockAction, setStockAction] = useState('add');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockNote, setStockNote] = useState('');
  const [stockUpdateLoading, setStockUpdateLoading] = useState(false);
  
  useEffect(() => {
    fetchInventoryItem();
    fetchStockHistory();
  }, [id]);
  
  const fetchInventoryItem = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Fetch inventory item from API
      const response = await axios.get(`${API_URL}/inventory/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setItem(response.data.data);
    } catch (err) {
      console.error('Error fetching inventory item:', err);
      setError('Failed to load inventory item. Please try again.');
      toast.error('Failed to load inventory item');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStockHistory = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Fetch stock history from API
      const response = await axios.get(`${API_URL}/inventory/${id}/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setStockHistory(response.data.data);
    } catch (err) {
      console.error('Error fetching stock history:', err);
      // We don't set the main error state here to still show the item details
      toast.error('Failed to load stock history');
    }
  };
  
  const handleDelete = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Call API to delete the inventory item
      await axios.delete(`${API_URL}/inventory/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Inventory item deleted successfully!');
      navigate('/inventory');
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      toast.error(err.response?.data?.message || 'Failed to delete inventory item. Please try again.');
    } finally {
      setOpenDeleteDialog(false);
    }
  };
  
  const handleStockUpdate = async () => {
    if (!stockQuantity || isNaN(stockQuantity) || Number(stockQuantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    setStockUpdateLoading(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Prepare data for API call
      const quantity = Number(stockQuantity);
      const updateData = {
        action: stockAction,
        quantity,
        note: stockNote
      };
      
      // Check if removing more than current stock
      if (stockAction === 'remove' && quantity > item.currentStock) {
        toast.error(`Cannot remove more than current stock (${item.currentStock})`);
        setStockUpdateLoading(false);
        return;
      }
      
      // Call API to update stock
      const response = await axios.patch(`/api/inventory/${id}/stock`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state with response data
      setItem(response.data.data);
      
      // Refresh stock history
      fetchStockHistory();
      
      // Show success message
      if (stockAction === 'add') {
        toast.success(`Added ${quantity} ${item.unit}(s) to inventory`);
      } else {
        toast.success(`Removed ${quantity} ${item.unit}(s) from inventory`);
      }
      
      // Reset form
      setStockQuantity('');
      setStockNote('');
      setOpenStockDialog(false);
    } catch (err) {
      console.error('Error updating stock:', err);
      toast.error('Failed to update stock. Please try again.');
    } finally {
      setStockUpdateLoading(false);
    }
  };
  
  const getStockStatusColor = () => {
    if (!item) return 'default';
    
    if (item.currentStock <= 0) {
      return 'error';
    } else if (item.currentStock <= item.minStockLevel) {
      return 'warning';
    } else {
      return 'success';
    }
  };
  
  const getStockStatusText = () => {
    if (!item) return 'Unknown';
    
    if (item.currentStock <= 0) {
      return 'Out of Stock';
    } else if (item.currentStock <= item.minStockLevel) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/inventory')}
          >
            Back to Inventory
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (!item) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Inventory item not found.</Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/inventory')}
          >
            Back to Inventory
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header with back button and actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/inventory')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h5" component="h1">
              Inventory Item Details
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/inventory/edit/${id}`)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDeleteDialog(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>
        
        {/* Main content */}
        <Grid container spacing={3}>
          {/* Item Overview */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Item Overview
                </Typography>
                <Chip 
                  label={getStockStatusText()} 
                  color={getStockStatusColor()} 
                  variant="outlined" 
                />
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalOfferIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                      Item Name:
                    </Typography>
                    <Typography variant="body1" component="span">
                      {item.itemName}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InventoryIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                      Item Code:
                    </Typography>
                    <Typography variant="body1" component="span">
                      {item.itemCode}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CategoryIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                      Category:
                    </Typography>
                    <Typography variant="body1" component="span">
                      {item.category}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                      Unit:
                    </Typography>
                    <Typography variant="body1" component="span">
                      {item.unit}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <DescriptionIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                        Description:
                      </Typography>
                      <Typography variant="body1" component="p">
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Stock Information */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Stock Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                  Current Stock:
                </Typography>
                <Typography variant="body1" component="span">
                  {item.currentStock} {item.unit}(s)
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                  Minimum Stock Level:
                </Typography>
                <Typography variant="body1" component="span">
                  {item.minStockLevel} {item.unit}(s)
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                  Price per Unit:
                </Typography>
                <Typography variant="body1" component="span">
                  ₹{item.price.toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                  Last Restocked:
                </Typography>
                <Typography variant="body1" component="span">
                  {item.lastRestocked}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setStockAction('add');
                    setOpenStockDialog(true);
                  }}
                  sx={{ flex: 1, mr: 1 }}
                >
                  Add Stock
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<RemoveIcon />}
                  onClick={() => {
                    setStockAction('remove');
                    setOpenStockDialog(true);
                  }}
                  sx={{ flex: 1, ml: 1 }}
                  disabled={item.currentStock <= 0}
                >
                  Remove Stock
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Additional Details */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Additional Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                      Supplier:
                    </Typography>
                    <Typography variant="body1" component="span">
                      {item.supplier}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                      Location:
                    </Typography>
                    <Typography variant="body1" component="span">
                      {item.location}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                      Expiry Date:
                    </Typography>
                    <Typography variant="body1" component="span">
                      {item.expiryDate}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                      Status:
                    </Typography>
                    <Chip 
                      label={item.isActive ? 'Active' : 'Inactive'} 
                      color={item.isActive ? 'success' : 'default'} 
                      size="small" 
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Stock History */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Stock History
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {stockHistory.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Previous Stock</TableCell>
                        <TableCell>New Stock</TableCell>
                        <TableCell>Note</TableCell>
                        <TableCell>Updated By</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stockHistory.map((history) => (
                        <TableRow key={history._id}>
                          <TableCell>{history.date}</TableCell>
                          <TableCell>
                            <Chip 
                              label={history.type === 'add' ? 'Added' : 'Removed'} 
                              color={history.type === 'add' ? 'success' : 'error'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>{history.quantity} {item.unit}(s)</TableCell>
                          <TableCell>{history.previousStock} {item.unit}(s)</TableCell>
                          <TableCell>{history.newStock} {item.unit}(s)</TableCell>
                          <TableCell>{history.note || '-'}</TableCell>
                          <TableCell>{history.updatedBy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  No stock history available.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Inventory Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{item.itemName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Stock Update Dialog */}
      <Dialog
        open={openStockDialog}
        onClose={() => !stockUpdateLoading && setOpenStockDialog(false)}
      >
        <DialogTitle>
          {stockAction === 'add' ? 'Add Stock' : 'Remove Stock'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {stockAction === 'add' 
              ? `Add stock to ${item.itemName}`
              : `Remove stock from ${item.itemName} (Current stock: ${item.currentStock} ${item.unit}(s))`}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            InputProps={{
              inputProps: { min: 1 },
              endAdornment: <InputAdornment position="end">{item.unit}(s)</InputAdornment>,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Note (Optional)"
            type="text"
            fullWidth
            value={stockNote}
            onChange={(e) => setStockNote(e.target.value)}
            placeholder="E.g., Regular restock, Used for patient treatment"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenStockDialog(false)} 
            disabled={stockUpdateLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStockUpdate} 
            color="primary" 
            variant="contained"
            disabled={stockUpdateLoading}
          >
            {stockUpdateLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              stockAction === 'add' ? 'Add' : 'Remove'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InventoryDetails;