// src/components/dashboard/MonthlyCommitsChart.jsx
import React from 'react';
import { Paper, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { BarChart as BarChartIcon } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import _ from 'lodash';

function MonthlyCommitsChart({ data }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const last24Months = Array.from({length: isMobile ? 12 : 24}, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      label: date.toLocaleString('pt-BR', { 
        month: isMobile ? 'short' : 'long', 
        year: 'numeric' 
      })
    };
  }).reverse();

  const monthlyCommitData = last24Months.map(({year, month, label}) => {
    const commits = data.filter(commit => {
      const commitDate = commit.date;
      return commitDate.getFullYear() === year && commitDate.getMonth() === month;
    }).length;
    return { label, commits };
  });

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BarChartIcon />
          Commits por Mês {isMobile ? '(12 meses)' : '(24 meses)'}
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={monthlyCommitData}
          margin={isMobile ? { left: 0, right: 0 } : { left: 20, right: 20 }}
        >
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: isMobile ? 10 : 12 }}
            interval={isMobile ? 1 : "preserveStartEnd"}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 60 : 30}
          />
          <YAxis width={isMobile ? 30 : 40} />
          <Tooltip />
          <Bar dataKey="commits" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default MonthlyCommitsChart;