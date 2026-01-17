// Path: components\dashboard\StatsCards.jsx
import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

function StatsCard({ title, value }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4">
          {value.toLocaleString('pt-BR')}
        </Typography>
      </Paper>
    </Grid>
  );
}

function StatsCards({ data }) {
  const commits2026 = data.filter(commit => commit.date.getFullYear() === 2026).length;
  const commits2025 = data.filter(commit => commit.date.getFullYear() === 2025).length;
  const repos2026 = new Set(data.filter(commit => 
    commit.date.getFullYear() === 2026).map(commit => commit.repo)
  ).size;
  const repos2025 = new Set(data.filter(commit => 
    commit.date.getFullYear() === 2025).map(commit => commit.repo)
  ).size;

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <StatsCard title="Commits em 2026" value={commits2026} />
      <StatsCard title="Commits em 2025" value={commits2025} />
      <StatsCard title="Repositórios Ativos 2026" value={repos2026} />
      <StatsCard title="Repositórios Ativos 2025" value={repos2025} />
    </Grid>
  );
}

export default StatsCards;