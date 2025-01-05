// src/components/dashboard/DailyCommitsChart.jsx
import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { Timeline } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import _ from 'lodash';

function DailyCommitsChart({ data }) {
  const last30Days = Array.from({length: 30}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const commitsByDate = _.groupBy(data, commit => 
    commit.date.toISOString().split('T')[0]
  );

  const dailyCommitData = last30Days.map(date => ({
    date: new Date(date).toLocaleDateString('pt-BR'),
    commits: (commitsByDate[date] || []).length
  }));

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Timeline />
          Commits por Dia (Últimos 30 dias)
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dailyCommitData}>
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            interval={6}
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="commits" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default DailyCommitsChart;