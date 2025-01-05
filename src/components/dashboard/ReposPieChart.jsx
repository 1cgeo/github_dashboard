// src/components/dashboard/ReposPieChart.jsx
import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { PieChart as PieChartIcon } from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import _ from 'lodash';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function ReposPieChart({ data }) {
  const commitsByRepo2025 = _.groupBy(
    data.filter(commit => commit.date.getFullYear() === 2025),
    'repo'
  );

  const pieChartData = Object.entries(commitsByRepo2025).map(([repo, commits]) => ({
    name: repo,
    value: commits.length
  }));

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PieChartIcon />
          Commits por Repositório em 2025
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default ReposPieChart;