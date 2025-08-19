import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Chip,
  Box,
  Divider,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const DrugDetails = ({ open, drug, onClose }) => {
  if (!drug) return null;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2">
            {drug.name}
          </Typography>
          <Button
            icon={<CloseIcon />}
            onClick={onClose}
            sx={{ minWidth: 'auto' }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Generic Name
                  </Typography>
                  <Typography variant="body1">
                    {drug.genericName || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Strength
                  </Typography>
                  <Typography variant="body1">
                    {drug.strength}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Form
                  </Typography>
                  <Typography variant="body1">
                    {drug.form.charAt(0).toUpperCase() + drug.form.slice(1)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {drug.category.charAt(0).toUpperCase() + drug.category.slice(1)}
                  </Typography>
                </Grid>
                
                {drug.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {drug.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
          
          {/* Brand Names */}
          {drug.brandNames && drug.brandNames.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Brand Names
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {drug.brandNames.map((brand, index) => (
                    <Chip
                      key={index}
                      label={brand}
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}
          
          {/* Active Ingredients */}
          {drug.activeIngredients && drug.activeIngredients.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Active Ingredients
                </Typography>
                <Grid container spacing={2}>
                  {drug.activeIngredients.map((ingredient, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ingredient {index + 1}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {ingredient.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Strength: {ingredient.strength}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}
          
          {/* Instructions */}
          {(drug.dosageInstructions || drug.storageInstructions) && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Instructions
                </Typography>
                <Grid container spacing={2}>
                  {drug.dosageInstructions && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Dosage Instructions
                      </Typography>
                      <Typography variant="body1">
                        {drug.dosageInstructions}
                      </Typography>
                    </Grid>
                  )}
                  
                  {drug.storageInstructions && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Storage Instructions
                      </Typography>
                      <Typography variant="body1">
                        {drug.storageInstructions}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          )}
          
          {/* Contraindications */}
          {drug.contraindications && drug.contraindications.length > 0 && (
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="error">
                  <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Contraindications
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {drug.contraindications.map((item, index) => (
                    <Typography key={index} variant="body2" sx={{ pl: 2 }}>
                      • {item}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}
          
          {/* Side Effects */}
          {drug.sideEffects && drug.sideEffects.length > 0 && (
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="warning.main">
                  <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Side Effects
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {drug.sideEffects.map((item, index) => (
                    <Typography key={index} variant="body2" sx={{ pl: 2 }}>
                      • {item}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}
          
          {/* Settings and Status */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Settings & Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={drug.isControlled ? 'Controlled Substance' : 'Non-Controlled'}
                      color={drug.isControlled ? 'warning' : 'default'}
                      size="small"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={drug.requiresPrescription ? 'Prescription Required' : 'Over the Counter'}
                      color={drug.requiresPrescription ? 'error' : 'success'}
                      size="small"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={drug.isActive ? 'Active' : 'Inactive'}
                      color={drug.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Metadata */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Metadata
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created By
                  </Typography>
                  <Typography variant="body1">
                    {drug.createdBy?.firstName} {drug.createdBy?.lastName}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created On
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(drug.createdAt)}
                  </Typography>
                </Grid>
                
                {drug.updatedBy && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Updated By
                      </Typography>
                      <Typography variant="body1">
                        {drug.updatedBy.firstName} {drug.updatedBy.lastName}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Updated On
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(drug.updatedAt)}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DrugDetails;
