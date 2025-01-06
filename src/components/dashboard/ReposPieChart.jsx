import React, { useState } from 'react';
import { Paper, Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon, ExpandMore, ExpandLess } from '@mui/icons-material';
import _ from 'lodash';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function ImprovedReposPieChart({ data }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showAll, setShowAll] = useState(false);

  // Processar dados por organização
  const groupedRepos = _.groupBy(data, commit => {
    const [org] = commit.repo.split('/');
    return org;
  });

  // Preparar dados para o gráfico
  const processData = () => {
    let allRepos = Object.entries(_.groupBy(data, 'repo'))
      .map(([repo, commits]) => ({
        name: repo.split('/')[1], // Remove org prefix
        fullName: repo,
        value: commits.length,
        org: repo.split('/')[0]
      }))
      .sort((a, b) => b.value - a.value);

    if (!showAll && allRepos.length > 9) {
      const topRepos = allRepos.slice(0, 8);
      const otherRepos = allRepos.slice(8);
      const otherValue = _.sumBy(otherRepos, 'value');
      
      return [
        ...topRepos,
        {
          name: `Outros (${otherRepos.length} repos)`,
          fullName: 'others',
          value: otherValue,
          org: 'others'
        }
      ];
    }

    return allRepos;
  };

  const pieChartData = processData();

  // Tooltip customizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const data = payload[0].payload;
      const total = _.sumBy(pieChartData, 'value');
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 1.5, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: theme.shadows[2]
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {data.fullName}
          </Typography>
          <Typography variant="body2">
            {data.value} commits ({percentage}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Legenda customizada
  const CustomLegend = ({ payload }) => (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 1,
      justifyContent: 'center',
      maxHeight: '100px',
      overflowY: 'auto',
      px: 2
    }}>
      {payload.map((entry, index) => (
        <Box
          key={`legend-${index}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            minWidth: isMobile ? '45%' : '30%'
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              backgroundColor: entry.color,
              borderRadius: '50%'
            }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              maxWidth: '90%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={entry.payload.fullName}
          >
            {entry.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PieChartIcon />
          Commits por Repositório
        </Typography>
        <Button
          size="small"
          onClick={() => setShowAll(!showAll)}
          startIcon={showAll ? <ExpandLess /> : <ExpandMore />}
        >
          {showAll ? 'Mostrar Menos' : 'Mostrar Todos'}
        </Button>
      </Box>
      
      <Box sx={{ height: isMobile ? 300 : 400 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="45%"
              innerRadius={isMobile ? 40 : 60}
              outerRadius={isMobile ? 70 : 90}
              paddingAngle={2}
              dataKey="value"
            >
              {pieChartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

export default ImprovedReposPieChart;