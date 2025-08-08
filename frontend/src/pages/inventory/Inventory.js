import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Box, Button, Grid, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, Alert, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

// Get API URL from environment variables or use default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Inventory = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [stockUpdateAmount, setStockUpdateAmount] = useState('');
  
  // Form state for adding/editing items
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    itemCode: '',
    category: '',
    description: '',
    unit: '',
    unitPrice: '',
    currentStock: '',
    minimumStock: '',
    supplier: {
      name: '',
      contactPerson: '',
      phone: '',
      email: ''
    },
    clinic: {
      _id: '',
      name: ''
    },
    expiryDate: '',
    status: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Build query parameters
      let queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (categoryFilter && categoryFilter !== 'all') queryParams.append('category', categoryFilter);
      if (statusFilter && statusFilter !== 'all') queryParams.append('status', statusFilter);
      queryParams.append('page', page + 1);
      queryParams.append('limit', rowsPerPage);
      
      // Make API call
      const response = await axios.get(`${API_URL}/inventory?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setInventory(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch inventory items');
      setLoading(false);
      toast.error('Failed to fetch inventory items');
    }
  };

  // Update useEffect to re-fetch when filters change
  useEffect(() => {
    fetchInventory();
  }, [page, rowsPerPage, searchTerm, categoryFilter, statusFilter]);

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      await axios.delete(`${API_URL}/inventory/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Inventory item deleted successfully');
      fetchInventory(); // Refresh the list
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      toast.error(err.response?.data?.message || 'Failed to delete inventory item');
    }
  };

  const handleUpdateStock = async () => {
    if (!currentItem || !stockUpdateAmount) {
      setFormErrors({...formErrors, stockUpdateAmount: 'Please enter a valid amount'});
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Get the clinic ID from the current item
      let clinicId;
      if (currentItem.clinics && currentItem.clinics.length > 0 && currentItem.clinics[0].clinic) {
        // Check if clinic is an object or a string ID
        clinicId = typeof currentItem.clinics[0].clinic === 'object' 
          ? currentItem.clinics[0].clinic._id 
          : currentItem.clinics[0].clinic;
      } else {
        // Fallback clinic ID if none is found
        clinicId = '60d21b4667d0d8992e610c10'; // Default clinic ID
      }
      
      await axios.put(`${API_URL}/inventory/${currentItem._id}/stock`, {
        updateAmount: parseInt(stockUpdateAmount, 10),
        clinicId: clinicId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Stock updated successfully');
      setOpenDialog(false);
      setStockUpdateAmount('');
      fetchInventory(); // Refresh the list
    } catch (err) {
      console.error('Error updating stock:', err);
      toast.error(err.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateInventoryData();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Prepare data for API - transform from form structure to backend model
      const inventoryData = {
        itemName: formData.itemName,
        itemCode: formData.itemCode,
        category: formData.category,
        description: formData.description || '',
        unit: formData.unit,
        costPrice: parseFloat(formData.unitPrice), // Map unitPrice to costPrice
        status: formData.status || 'active',
        // Structure clinics as an array with clinic reference
        clinics: [{
          clinic: formData.clinic._id,
          currentStock: parseInt(formData.currentStock, 10),
          minStockLevel: parseInt(formData.minimumStock, 10),
          location: formData.location || 'Main Storage'
        }],
        supplier: formData.supplier,
        expiryDate: formData.expiryDate || null
      };
      
      if (isEditing) {
        // Update existing item
        await axios.put(`${API_URL}/inventory/${formData._id}`, inventoryData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('Inventory item updated successfully');
      } else {
        // Create new item
        await axios.post(`${API_URL}/inventory`, inventoryData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('Inventory item created successfully');
      }
      
      setFormOpen(false);
      // Reset form data
      setFormData({
        itemName: '',
        itemCode: '',
        category: '',
        description: '',
        unit: '',
        unitPrice: '',
        currentStock: '',
        minimumStock: '',
        supplier: {
          name: '',
          contactPerson: '',
          phone: '',
          email: ''
        },
        location: '',
        status: 'active',
        clinic: { 
          _id: '60d21b4667d0d8992e610c10', 
          name: 'Main Clinic' 
        }
      });
      setFormErrors({});
      setIsEditing(false);
      fetchInventory(); // Refresh the list
    } catch (err) {
      console.error('Error saving inventory item:', err);
      toast.error(err.response?.data?.message || 'Failed to save inventory item');
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

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleOpenStockDialog = (item) => {
    setCurrentItem(item);
    setStockUpdateAmount('');
    setOpenDialog(true);
    setFormErrors({});
  };

  const handleCloseStockDialog = () => {
    setOpenDialog(false);
    setCurrentItem(null);
    setStockUpdateAmount('');
  };

  const handleStockUpdate = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const amount = parseInt(stockUpdateAmount);
      
      // Get the clinic ID from the current item
      let clinicId;
      if (currentItem.clinics && currentItem.clinics.length > 0 && currentItem.clinics[0].clinic) {
        // Check if clinic is an object or a string ID
        clinicId = typeof currentItem.clinics[0].clinic === 'object' 
          ? currentItem.clinics[0].clinic._id 
          : currentItem.clinics[0].clinic;
      } else {
        // Fallback clinic ID if none is found
        clinicId = '60d21b4667d0d8992e610c10'; // Default clinic ID
      }
      
      // Call API to update stock using the correct endpoint and data structure
      await axios.put(`${API_URL}/inventory/${currentItem._id}/stock`, {
        updateAmount: amount,
        clinicId: clinicId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh inventory list to get updated data
      fetchInventory();
      
      toast.success(`Stock updated successfully for ${currentItem.itemName}`);
      handleCloseStockDialog();
    } catch (err) {
      console.error('Error updating stock:', err);
      toast.error(err.response?.data?.message || 'Failed to update stock. Please try again.');
    }
  };

  const handleOpenForm = (item = null) => {
    if (item) {
      // Transform the item data to match the form structure
      const transformedItem = {
        ...item,
        // Extract currentStock and minimumStock from the first clinic in the clinics array
        currentStock: item.clinics && item.clinics.length > 0 ? item.clinics[0].currentStock : '',
        minimumStock: item.clinics && item.clinics.length > 0 ? item.clinics[0].minStockLevel : '',
        // Map costPrice to unitPrice for the form
        unitPrice: item.costPrice || '',
        // Ensure supplier object exists
        supplier: item.supplier || {
          name: '',
          contactPerson: '',
          phone: '',
          email: ''
        },
        // Set clinic from the first clinic in the clinics array
        clinic: item.clinics && item.clinics.length > 0 && item.clinics[0].clinic ? 
          { 
            _id: typeof item.clinics[0].clinic === 'object' ? item.clinics[0].clinic._id : item.clinics[0].clinic, 
            name: typeof item.clinics[0].clinic === 'object' ? (item.clinics[0].clinic.name || 'Selected Clinic') : 'Selected Clinic' 
          } : 
          { _id: '', name: 'Main Clinic' },
        // Set location from the first clinic in the clinics array
        location: item.clinics && item.clinics.length > 0 ? item.clinics[0].location : 'Main Storage'
      };
      setFormData(transformedItem);
      setIsEditing(true);
    } else {
      setFormData({
        itemName: '',
        itemCode: '',
        category: '',
        description: '',
        unit: '',
        unitPrice: '', // This will map to costPrice
        currentStock: '',
        minimumStock: '',
        supplier: {
          name: '',
          contactPerson: '',
          phone: '',
          email: ''
        },
        clinic: {
          _id: '60d21b4667d0d8992e610c10', // Default clinic
          name: 'Main Clinic'
        },
        expiryDate: '',
        status: 'active',
        location: 'Main Storage'
      });
      setIsEditing(false);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Additional validation function
  const validateInventoryData = () => {
    const errors = {};
    if (!formData.itemName) errors.itemName = 'Item name is required';
    if (!formData.itemCode) errors.itemCode = 'Item code is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.unit) errors.unit = 'Unit is required';
    if (!formData.unitPrice) errors.unitPrice = 'Unit price is required';
    if (!formData.currentStock && formData.currentStock !== 0) errors.currentStock = 'Current stock is required';
    if (!formData.minimumStock && formData.minimumStock !== 0) errors.minimumStock = 'Minimum stock is required';
    
    return errors;
  };
  
  // This function has been removed as it was a duplicate of handleFormSubmit

  // Removed duplicate function

  // We're using server-side filtering and pagination, so we don't need to filter the inventory here
  // The API handles filtering and pagination based on the query parameters we send

  // Define categories and statuses based on the backend model
  const categories = [
    'all',
    'Consumables',
    'Instruments',
    'Equipment',
    'Medicines',
    'Implants',
    'Orthodontic Supplies',
    'Office Supplies',
    'Others'
  ];
  
  const statuses = [
    'all',
    'active',
    'low stock',
    'out of stock'
  ];

  // Render status chip with appropriate color
  const renderStatusChip = (status) => {
    let color = 'default';
    let icon = null;
    let label = status;
    
    switch (status) {
      case 'active':
        color = 'success';
        icon = <CheckCircleIcon fontSize="small" />;
        label = 'In Stock';
        break;
      case 'low stock':
        color = 'warning';
        icon = <WarningIcon fontSize="small" />;
        label = 'Low Stock';
        break;
      case 'out of stock':
        color = 'error';
        icon = <ErrorIcon fontSize="small" />;
        label = 'Out of Stock';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={label} 
        color={color} 
        size="small" 
        icon={icon}
      />
    );
  };

  // Format currency in Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Inventory Management
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
            >
              Add Item
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search Inventory"
                variant="outlined"
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status"
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchInventory}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.length > 0 ? (
                inventory.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.itemCode}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">{formatCurrency(item.costPrice)}</TableCell>
                    <TableCell align="right">
                      {item.clinics && item.clinics.length > 0 
                        ? `${item.clinics[0].currentStock} ${item.unit || ''}` 
                        : `0 ${item.unit || ''}`}
                      {item.clinics && item.clinics.length > 0 && 
                       item.clinics[0].currentStock <= item.clinics[0].minStockLevel && (
                        <Tooltip title="Low Stock">
                          <WarningIcon color="error" fontSize="small" style={{ marginLeft: '8px' }} />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>{renderStatusChip(item.status || 'active')}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Update Stock">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenStockDialog(item)}
                        >
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenForm(item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteItem(item._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No inventory items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={inventory.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>

      {/* Stock Update Dialog */}
      <Dialog open={openDialog} onClose={handleCloseStockDialog}>
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1">
              {currentItem?.itemName} ({currentItem?.itemCode})
            </Typography>
            <Typography variant="body2" gutterBottom>
              Current Stock: {currentItem?.clinics && currentItem?.clinics.length > 0 
                ? currentItem.clinics[0].currentStock 
                : 0} {currentItem?.unit}(s)
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Add/Remove Stock"
              type="number"
              fullWidth
              variant="outlined"
              value={stockUpdateAmount}
              onChange={(e) => setStockUpdateAmount(e.target.value)}
              helperText="Use positive values to add stock, negative to remove"
              error={!!formErrors.stockUpdateAmount}
            />
            {formErrors.stockUpdateAmount && (
              <Typography variant="caption" color="error">
                {formErrors.stockUpdateAmount}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStockDialog}>Cancel</Button>
          <Button 
            onClick={handleStockUpdate} 
            color="primary"
            disabled={!stockUpdateAmount}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Item Form Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Item Name"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleFormChange}
                  error={!!formErrors.itemName}
                  helperText={formErrors.itemName}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Item Code"
                  name="itemCode"
                  value={formData.itemCode}
                  onChange={handleFormChange}
                  error={!!formErrors.itemCode}
                  helperText={formErrors.itemCode}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required error={!!formErrors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    label="Category"
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    <MenuItem value="Consumables">Consumables</MenuItem>
                    <MenuItem value="Instruments">Instruments</MenuItem>
                    <MenuItem value="Equipment">Equipment</MenuItem>
                    <MenuItem value="Medicines">Medicines</MenuItem>
                    <MenuItem value="Implants">Implants</MenuItem>
                    <MenuItem value="Orthodontic Supplies">Orthodontic Supplies</MenuItem>
                    <MenuItem value="Office Supplies">Office Supplies</MenuItem>
                    <MenuItem value="Others">Others</MenuItem>
                  </Select>
                  {formErrors.category && (
                    <Typography variant="caption" color="error">
                      {formErrors.category}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required error={!!formErrors.unit}>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unit"
                    value={formData.unit}
                    onChange={handleFormChange}
                    label="Unit"
                  >
                    <MenuItem value="">Select Unit</MenuItem>
                    <MenuItem value="Piece">Piece</MenuItem>
                    <MenuItem value="Box">Box</MenuItem>
                    <MenuItem value="Pack">Pack</MenuItem>
                    <MenuItem value="Set">Set</MenuItem>
                    <MenuItem value="Kit">Kit</MenuItem>
                    <MenuItem value="Bottle">Bottle</MenuItem>
                    <MenuItem value="Tube">Tube</MenuItem>
                    <MenuItem value="Syringe">Syringe</MenuItem>
                    <MenuItem value="Gram">Gram</MenuItem>
                    <MenuItem value="Kilogram">Kilogram</MenuItem>
                    <MenuItem value="Milliliter">Milliliter</MenuItem>
                    <MenuItem value="Liter">Liter</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {formErrors.unit && (
                    <Typography variant="caption" color="error">
                      {formErrors.unit}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Unit Price (₹)"
                  name="unitPrice"
                  type="number"
                  value={formData.unitPrice}
                  onChange={handleFormChange}
                  error={!!formErrors.unitPrice}
                  helperText={formErrors.unitPrice}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Current Stock"
                  name="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={handleFormChange}
                  error={!!formErrors.currentStock}
                  helperText={formErrors.currentStock}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Minimum Stock"
                  name="minimumStock"
                  type="number"
                  value={formData.minimumStock}
                  onChange={handleFormChange}
                  error={!!formErrors.minimumStock}
                  helperText={formErrors.minimumStock}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Supplier Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Supplier Name"
                  name="supplier.name"
                  value={formData.supplier.name}
                  onChange={handleFormChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  name="supplier.contactPerson"
                  value={formData.supplier.contactPerson}
                  onChange={handleFormChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="supplier.phone"
                  value={formData.supplier.phone}
                  onChange={handleFormChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="supplier.email"
                  value={formData.supplier.email}
                  onChange={handleFormChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={handleFormChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button onClick={handleFormSubmit} color="primary">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Inventory;