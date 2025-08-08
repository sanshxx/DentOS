import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Chip
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Theme Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose your preferred theme for the application
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LightModeIcon sx={{ mr: 1, color: mode === 'light' ? 'primary.main' : 'text.disabled' }} />
            <Typography variant="body1">Light Theme</Typography>
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={mode === 'dark'}
                onChange={toggleTheme}
                color="primary"
              />
            }
            label=""
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1">Dark Theme</Typography>
            <DarkModeIcon sx={{ ml: 1, color: mode === 'dark' ? 'primary.main' : 'text.disabled' }} />
          </Box>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Chip
            label={mode === 'light' ? 'Light Mode Active' : 'Dark Mode Active'}
            color={mode === 'light' ? 'primary' : 'secondary'}
            size="small"
          />
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Your theme preference will be saved and applied across all sessions.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ThemeToggle;
