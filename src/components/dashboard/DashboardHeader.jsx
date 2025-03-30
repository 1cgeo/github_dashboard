// Path: components\dashboard\DashboardHeader.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import logoImage from '../../assets/1cgeo.png';
import ConsolidatedDataExport from './ConsolidatedDataExport';

function DashboardHeader({ data }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <img src={logoImage} alt="1º CGEO Logo" style={{ height: '100px' }} />
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard de Commits - 1º CGEO
        </Typography>
        <Typography color="text.secondary">
          Monitoramento de atividade em repositórios administrados pelo 1º CGEO desde 01/01/2022
        </Typography>
        <ConsolidatedDataExport data={data} />
      </Box>
    </Box>
  );
}

export default DashboardHeader;