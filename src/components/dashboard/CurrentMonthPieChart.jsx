// src/components/dashboard/CurrentMonthPieChart.jsx
import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import _ from 'lodash';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function CurrentMonthPieChart({ data }) {
  // Filtra commits do mês atual
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthCommits = data.filter(commit => {
    const commitDate = commit.date;
    return commitDate.getMonth() === currentMonth && 
           commitDate.getFullYear() === currentYear;
  });

  // Agrupa por repositório
  const commitsByRepo = _.groupBy(currentMonthCommits, 'repo');
  
  // Prepara dados para o gráfico
  const pieChartData = Object.entries(commitsByRepo).map(([repo, commits]) => ({
    name: repo,
    value: commits.length
  }));

  // Ordena por quantidade de commits (maior para menor)
  const sortedPieChartData = _.orderBy(pieChartData, ['value'], ['desc']);

  // Calcula o total de commits para a porcentagem
  const totalCommits = _.sumBy(pieChartData, 'value');

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 1.5, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}>
          <Typography variant="body2" color="text.primary">
            <strong>{data.name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.value} commits ({((data.value / totalCommits) * 100).toFixed(1)}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday />
          Commits por Repositório ({currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })})
        </Typography>
      </Box>
      <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
        {sortedPieChartData.length > 0 ? (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={sortedPieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({name, value}) => `${name} (${value})`}
              >
                {sortedPieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              Nenhum commit encontrado neste mês
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default CurrentMonthPieChart;