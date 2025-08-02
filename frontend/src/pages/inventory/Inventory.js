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
      // In a real app, we would fetch from the API
      // For now, we'll simulate an API call
      setTimeout(() => {
        // Mock API call
        const mockResponse = {
          success: true,
          count: 5,
          data: [
            {
              _id: '60d21b4667d0d8992e610c85',
              itemName: 'Dental Floss',
              itemCode: 'DF-001',
              category: 'Consumables',
              description: 'Waxed dental floss for patient use',
              unit: 'Box',
              unitPrice: 120,
              currentStock: 45,
              minimumStock: 10,
              supplier: {
                name: 'Dental Supplies Ltd',
                contactPerson: 'Rajesh Kumar',
                phone: '9876543210',
                email: 'rajesh@dentalsupplies.com'
              },
              clinic: {
                _id: '60d21b4667d0d8992e610c10',
                name: 'Main Clinic'
              },
              expiryDate: '2024-06-30',
              lastRestocked: '2023-01-10',
              status: 'In Stock'
            },
            {
              _id: '60d21b4667d0d8992e610c86',
              itemName: 'Dental Mirrors',
              itemCode: 'DM-002',
              category: 'Instruments',
              description: 'Stainless steel dental mirrors',
              unit: 'Piece',
              unitPrice: 250,
              currentStock: 20,
              minimumStock: 5,
              supplier: {
                name: 'Medical Instruments Inc',
                contactPerson: 'Priya Sharma',
                phone: '9876543211',
                email: 'priya@medicalinstruments.com'
              },
              clinic: {
                _id: '60d21b4667d0d8992e610c10',
                name: 'Main Clinic'
              },
              expiryDate: null,
              lastRestocked: '2023-02-15',
              status: 'In Stock'
            },
            {
              _id: '60d21b4667d0d8992e610c87',
              itemName: 'Dental Anesthetic',
              itemCode: 'DA-003',
              category: 'Medicines',
              description: 'Local anesthetic for dental procedures',
              unit: 'Box',
              unitPrice: 850,
              currentStock: 8,
              minimumStock: 5,
              supplier: {
                name: 'Pharma Distributors',
                contactPerson: 'Amit Patel',
                phone: '9876543212',
                email: 'amit@pharmadist.com'
              },
              clinic: {
                _id: '60d21b4667d0d8992e610c10',
                name: 'Main Clinic'
              },
              expiryDate: '2023-12-31',
              lastRestocked: '2023-03-05',
              status: 'Low Stock'
            },
            {
              _id: '60d21b4667d0d8992e610c88',
              itemName: 'Dental Chair',
              itemCode: 'DC-004',
              category: 'Equipment',
              description: 'Fully automatic dental chair with LED light',
              unit: 'Piece',
              unitPrice: 250000,
              currentStock: 2,
              minimumStock: 1,
              supplier: {
                name: 'Dental Equipment Co',
                contactPerson: 'Vikram Mehta',
                phone: '9876543213',
                email: 'vikram@dentalequip.com'
              },
              clinic: {
                _id: '60d21b4667d0d8992e610c10',
                name: 'Main Clinic'
              },
              expiryDate: null,
              lastRestocked: '2023-01-20',
              status: 'In Stock'
            },
            {
              _id: '60d21b4667d0d8992e610c89',
              itemName: 'Dental Implants',
              itemCode: 'DI-005',
              category: 'Implants',
              description: 'Titanium dental implants',
              unit: 'Piece',
              unitPrice: 3500,
              currentStock: 0,
              minimumStock: 5,
              supplier: {
                name: 'Implant Specialists',
                contactPerson: 'Neha Gupta',
                phone: '9876543214',
                email: 'neha@implantspecialists.com'
              },
              clinic: {
                _id: '60d21b4667d0d8992e610c10',
                name: 'Main Clinic'
              },
              expiryDate: '2025-06-30',
              lastRestocked: '2022-12-10',
              status: 'Out of Stock'
            }
          ]
        };
        
        setInventory(mockResponse.data);
        setLoading(false);
      }, 1000); // Simulate loading delay
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory data. Please try again.');
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
  };

  const handleCloseStockDialog = () => {
    setOpenDialog(false);
    setCurrentItem(null);
    setStockUpdateAmount('');
  };

  const handleStockUpdate = () => {
    // In a real app, we would call the API to update the stock
    const newStock = parseInt(currentItem.currentStock) + parseInt(stockUpdateAmount);
    
    // Update the inventory state
    const updatedInventory = inventory.map(item => {
      if (item._id === currentItem._id) {
        return {
          ...item,
          currentStock: newStock,
          lastRestocked: new Date().toISOString().split('T')[0],
          status: newStock <= 0 ? 'Out of Stock' : 
                  newStock <= item.minimumStock ? 'Low Stock' : 'In Stock'
        };
      }
      return item;
    });
    
    setInventory(updatedInventory);
    toast.success(`Stock updated successfully for ${currentItem.itemName}`);
    handleCloseStockDialog();
  };

  const handleOpenForm = (item = null) => {
    if (item) {
      setFormData(item);
      setIsEditing(true);
    } else {
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
        clinic: {
          _id: '60d21b4667d0d8992e610c10', // Default clinic
          name: 'Main Clinic'
        },
        expiryDate: '',
        status: ''
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

  const handleFormSubmit = () => {
    // Basic validation
    const errors = {};
    if (!formData.itemName) errors.itemName = 'Item name is required';
    if (!formData.itemCode) errors.itemCode = 'Item code is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.unit) errors.unit = 'Unit is required';
    if (!formData.unitPrice) errors.unitPrice = 'Unit price is required';
    if (!formData.currentStock && formData.currentStock !== 0) errors.currentStock = 'Current stock is required';
    if (!formData.minimumStock && formData.minimumStock !== 0) errors.minimumStock = 'Minimum stock is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // In a real app, we would call the API to create/update the item
    if (isEditing) {
      // Update existing item
      const updatedInventory = inventory.map(item => {
        if (item._id === formData._id) {
          return formData;
        }
        return item;
      });
      
      setInventory(updatedInventory);
      toast.success(`${formData.itemName} updated successfully`);
    } else {
      // Create new item
      const newItem = {
        ...formData,
        _id: `new-${Date.now()}`,
        lastRestocked: new Date().toISOString().split('T')[0],
        status: formData.currentStock <= 0 ? 'Out of Stock' : 
                formData.currentStock <= formData.minimumStock ? 'Low Stock' : 'In Stock'
      };
      
      setInventory([...inventory, newItem]);
      toast.success(`${formData.itemName} added to inventory`);
    }
    
    handleCloseForm();
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      // In a real app, we would call the API to delete the item
      const updatedInventory = inventory.filter(item => item._id !== id);
      setInventory(updatedInventory);
      toast.success('Item deleted successfully');
    }
  };

  // Filter inventory based on search term and filters
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const paginatedInventory = filteredInventory.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Get unique categories for filter
  const categories = ['all', ...new Set(inventory.map(item => item.category))];
  const statuses = ['all', ...new Set(inventory.map(item => item.status))];

  // Render status chip with appropriate color
  const renderStatusChip = (status) => {
    let color = 'default';
    let icon = null;
    
    switch (status) {
      case 'In Stock':
        color = 'success';
        icon = <CheckCircleIcon fontSize="small" />;
        break;
      case 'Low Stock':
        color = 'warning';
        icon = <WarningIcon fontSize="small" />;
        break;
      case 'Out of Stock':
        color = 'error';
        icon = <ErrorIcon fontSize="small" />;
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status} 
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
              {paginatedInventory.length > 0 ? (
                paginatedInventory.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.itemCode}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell align="right">
                      {item.currentStock} {item.unit}(s)
                      {item.minimumStock && item.currentStock <= item.minimumStock && (
                        <Typography variant="caption" color="error" display="block">
                          Min: {item.minimumStock}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{renderStatusChip(item.status)}</TableCell>
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
            count={filteredInventory.length}
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
              Current Stock: {currentItem?.currentStock} {currentItem?.unit}(s)
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
            />
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