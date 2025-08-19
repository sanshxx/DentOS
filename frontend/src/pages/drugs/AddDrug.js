import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import { drugAPI } from '../../api/drugs';

const AddDrug = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    brandNames: [''],
    strength: '',
    form: '',
    category: '',
    description: '',
    activeIngredients: [{ name: '', strength: '' }],
    contraindications: [''],
    sideEffects: [''],
    dosageInstructions: '',
    storageInstructions: '',
    isControlled: false,
    requiresPrescription: true,
    isActive: true
  });
  
  const [categories, setCategories] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (open) {
      loadFormData();
    }
  }, [open]);
  
  const loadFormData = async () => {
    try {
      const [categoriesRes, formsRes] = await Promise.all([
        drugAPI.getDrugCategories(),
        drugAPI.getDrugForms()
      ]);
      setCategories(categoriesRes.data || []);
      setForms(formsRes.data || []);
    } catch (err) {
      console.error('Error loading form data:', err);
    }
  };
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  const handleArrayFieldChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? value : item
      )
    }));
  };
  
  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], field === 'activeIngredients' ? { name: '', strength: '' } : '']
    }));
  };
  
  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Drug name is required';
    if (!formData.strength.trim()) newErrors.strength = 'Strength is required';
    if (!formData.form) newErrors.form = 'Form is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Clean up empty array fields
      const cleanData = {
        ...formData,
        brandNames: formData.brandNames.filter(name => name.trim()),
        contraindications: formData.contraindications.filter(item => item.trim()),
        sideEffects: formData.sideEffects.filter(item => item.trim()),
        activeIngredients: formData.activeIngredients.filter(ing => ing.name.trim() && ing.strength.trim())
      };
      
      await onAdd(cleanData);
      handleClose();
    } catch (err) {
      console.error('Error adding drug:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setFormData({
      name: '',
      genericName: '',
      brandNames: [''],
      strength: '',
      form: '',
      category: '',
      description: '',
      activeIngredients: [{ name: '', strength: '' }],
      contraindications: [''],
      sideEffects: [''],
      dosageInstructions: '',
      storageInstructions: '',
      isControlled: false,
      requiresPrescription: true,
      isActive: true
    });
    setErrors({});
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Drug</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Drug Name *"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Generic Name"
              value={formData.genericName}
              onChange={(e) => handleInputChange('genericName', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Strength *"
              value={formData.strength}
              onChange={(e) => handleInputChange('strength', e.target.value)}
              error={!!errors.strength}
              helperText={errors.strength}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.form}>
              <InputLabel>Form *</InputLabel>
              <Select
                value={formData.form}
                onChange={(e) => handleInputChange('form', e.target.value)}
                label="Form *"
              >
                {forms.map((form) => (
                  <MenuItem key={form} value={form}>
                    {form.charAt(0).toUpperCase() + form.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Category *</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                label="Category *"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Grid>
          
          {/* Brand Names */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Brand Names</Typography>
            {formData.brandNames.map((brand, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  label={`Brand Name ${index + 1}`}
                  value={brand}
                  onChange={(e) => handleArrayFieldChange('brandNames', index, e.target.value)}
                />
                {formData.brandNames.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeArrayField('brandNames', index)}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={() => addArrayField('brandNames')}
              sx={{ mt: 1 }}
            >
              Add Brand Name
            </Button>
          </Grid>
          
          {/* Active Ingredients */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Active Ingredients</Typography>
            {formData.activeIngredients.map((ingredient, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  label="Ingredient Name"
                  value={ingredient.name}
                  onChange={(e) => handleArrayFieldChange('activeIngredients', index, { ...ingredient, name: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Strength"
                  value={ingredient.strength}
                  onChange={(e) => handleArrayFieldChange('activeIngredients', index, { ...ingredient, strength: e.target.value })}
                />
                {formData.activeIngredients.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeArrayField('activeIngredients', index)}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={() => addArrayField('activeIngredients')}
              sx={{ mt: 1 }}
            >
              Add Ingredient
            </Button>
          </Grid>
          
          {/* Instructions */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Instructions</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Dosage Instructions"
              value={formData.dosageInstructions}
              onChange={(e) => handleInputChange('dosageInstructions', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Storage Instructions"
              value={formData.storageInstructions}
              onChange={(e) => handleInputChange('storageInstructions', e.target.value)}
            />
          </Grid>
          
          {/* Contraindications and Side Effects */}
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>Contraindications</Typography>
            {formData.contraindications.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  label={`Contraindication ${index + 1}`}
                  value={item}
                  onChange={(e) => handleArrayFieldChange('contraindications', index, e.target.value)}
                />
                {formData.contraindications.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeArrayField('contraindications', index)}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={() => addArrayField('contraindications')}
              sx={{ mt: 1 }}
            >
              Add Contraindication
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>Side Effects</Typography>
            {formData.sideEffects.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  label={`Side Effect ${index + 1}`}
                  value={item}
                  onChange={(e) => handleArrayFieldChange('sideEffects', index, e.target.value)}
                />
                {formData.sideEffects.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeArrayField('sideEffects', index)}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={() => addArrayField('sideEffects')}
              sx={{ mt: 1 }}
            >
              Add Side Effect
            </Button>
          </Grid>
          
          {/* Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Settings</Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isControlled}
                  onChange={(e) => handleInputChange('isControlled', e.target.checked)}
                />
              }
              label="Controlled Substance"
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.requiresPrescription}
                  onChange={(e) => handleInputChange('requiresPrescription', e.target.checked)}
                />
              }
              label="Requires Prescription"
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Drug'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDrug;
