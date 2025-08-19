import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Pagination,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { drugAPI } from '../../api/drugs';
import AddDrug from './AddDrug';
import EditDrug from './EditDrug';
import DrugDetails from './DrugDetails';
import { useAuth } from '../../context/AuthContext';

const Drugs = () => {
  const { user } = useAuth();
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination and filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setActive] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Load drugs and categories
  useEffect(() => {
    loadDrugs();
    loadCategories();
  }, [page, search, category, isActive]);
  
  const loadDrugs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        search: search || undefined,
        category: category || undefined,
        isActive: isActive !== '' ? isActive : undefined
      };
      
      const response = await drugAPI.getDrugs(params);
      setDrugs(response.data.docs || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError('Failed to load drugs');
      console.error('Error loading drugs:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadCategories = async () => {
    try {
      const response = await drugAPI.getDrugCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };
  
  const handleAddDrug = async (drugData) => {
    try {
      await drugAPI.createDrug(drugData);
      setSuccess('Drug added successfully');
      setAddDialogOpen(false);
      loadDrugs();
    } catch (err) {
      setError('Failed to add drug');
      console.error('Error adding drug:', err);
    }
  };
  
  const handleEditDrug = async (id, drugData) => {
    try {
      await drugAPI.updateDrug(id, drugData);
      setSuccess('Drug updated successfully');
      setEditDialogOpen(false);
      setSelectedDrug(null);
      loadDrugs();
    } catch (err) {
      setError('Failed to update drug');
      console.error('Error updating drug:', err);
    }
  };
  
  const handleDeleteDrug = async () => {
    try {
      await drugAPI.deleteDrug(selectedDrug._id);
      setSuccess('Drug deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedDrug(null);
      loadDrugs();
    } catch (err) {
      setError('Failed to delete drug');
      console.error('Error deleting drug:', err);
    }
  };
  
  const handleViewDrug = (drug) => {
    setSelectedDrug(drug);
    setViewDialogOpen(true);
  };
  
  const handleEditDrugClick = (drug) => {
    setSelectedDrug(drug);
    setEditDialogOpen(true);
  };
  
  const handleDeleteDrugClick = (drug) => {
    setSelectedDrug(drug);
    setDeleteDialogOpen(true);
  };
  
  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setActive('');
    setPage(1);
  };
  
  const canManageDrugs = user?.role === 'admin' || user?.role === 'doctor';
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Drug Management
        </Typography>
        {canManageDrugs && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Drug
          </Button>
        )}
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search Drugs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={isActive}
                onChange={(e) => setActive(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={clearFilters}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Drugs Grid */}
      <Grid container spacing={3}>
        {drugs.map((drug) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={drug._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {drug.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {drug.genericName}
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Chip
                    label={drug.strength}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={drug.form}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={drug.category}
                    size="small"
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {drug.description?.substring(0, 100)}
                  {drug.description?.length > 100 && '...'}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {drug.isControlled && (
                    <Chip
                      label="Controlled"
                      size="small"
                      color="warning"
                      sx={{ mr: 1 }}
                    />
                  )}
                  <Chip
                    label={drug.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    color={drug.isActive ? 'success' : 'default'}
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={() => handleViewDrug(drug)}
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                {canManageDrugs && (
                  <>
                    <Tooltip title="Edit Drug">
                      <IconButton
                        size="small"
                        onClick={() => handleEditDrugClick(drug)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Drug">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteDrugClick(drug)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
      
      {/* Dialogs */}
      <AddDrug
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddDrug}
      />
      
      {selectedDrug && (
        <>
          <EditDrug
            open={editDialogOpen}
            drug={selectedDrug}
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedDrug(null);
            }}
            onEdit={handleEditDrug}
          />
          
          <DrugDetails
            open={viewDialogOpen}
            drug={selectedDrug}
            onClose={() => {
              setViewDialogOpen(false);
              setSelectedDrug(null);
            }}
          />
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedDrug?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteDrug} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Drugs;
