import React from 'react';
import { Box, Typography } from '@mui/material';
import logoImage from '../../assets/1cgeo.png';

function DashboardHeader() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <img src={logoImage} alt="1º CGEO Logo" style={{ height: '100px' }} />
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard de Commits - 1º CGEO
        </Typography>
        <Typography color="text.secondary">
          Monitoramento de atividade em repositórios administrados pelo 1º CGEO
        </Typography>
      </Box>
    </Box>
  );
}

export default DashboardHeader;