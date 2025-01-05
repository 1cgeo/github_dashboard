import React from 'react';
import { Paper, Box, Typography, useTheme } from '@mui/material';
import { BarChart as BarChartIcon } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Rectangle } from 'recharts';
import _ from 'lodash';

function MonthlyCommitsChart({ data }) {
  const theme = useTheme();

  const last24Months = Array.from({length: 24}, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      label: date.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })
    };
  }).reverse();

  const monthlyCommitData = last24Months.map(({year, month, label}) => {
    const commits = data.filter(commit => {
      const commitDate = commit.date;
      return commitDate.getFullYear() === year && commitDate.getMonth() === month;
    }).length;
    return { name: label, commits };
  });

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BarChartIcon />
          Commits por Mês (Últimos 24 meses)
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyCommitData}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis />
          <Tooltip 
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              color: theme.palette.text.primary
            }}
          />
          <Bar 
            dataKey="commits" 
            fill={theme.palette.primary.main}
            activeBar={<Rectangle fill={theme.palette.primary.light} />}
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default MonthlyCommitsChart;