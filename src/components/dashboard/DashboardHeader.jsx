// src/components/dashboard/DashboardHeader.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

function DashboardHeader() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        1º CGEO Dashboard de Commits
      </Typography>
      <Typography color="text.secondary">
        Monitoramento de atividade em repositórios administrados pelo 1º CGEO
      </Typography>
    </Box>
  );
}

export default DashboardHeader;