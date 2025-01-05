// src/components/ThemeToggle.jsx
import React from 'react';
import { IconButton, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

function ThemeToggle({ toggleColorMode }) {
  const theme = useTheme();

  return (
    <IconButton 
      onClick={toggleColorMode} 
      color="inherit"
      sx={{ 
        position: 'fixed', 
        right: 20, 
        bottom: 20,
        bgcolor: 'background.paper',
        boxShadow: 2,
        '&:hover': {
          bgcolor: 'background.paper',
        }
      }}
    >
      {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
}

export default ThemeToggle;