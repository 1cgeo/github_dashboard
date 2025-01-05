import React from 'react';
import { Paper, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import _ from 'lodash';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function CurrentMonthPieChart({ data }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthCommits = data.filter(commit => {
    const commitDate = commit.date;
    return commitDate.getMonth() === currentMonth && 
           commitDate.getFullYear() === currentYear;
  });

  const commitsByRepo = _.groupBy(currentMonthCommits, 'repo');
  
  let pieChartData = Object.entries(commitsByRepo).map(([repo, commits]) => ({
    name: repo,
    value: commits.length
  }));

  // Para mobile, mostrar apenas os top 4 repositórios e agrupar o resto
  if (isMobile && pieChartData.length > 4) {
    const sortedData = _.orderBy(pieChartData, ['value'], ['desc']);
    const topRepos = sortedData.slice(0, 3);
    const otherRepos = sortedData.slice(3);
    const otherValue = _.sumBy(otherRepos, 'value');
    
    pieChartData = [
      ...topRepos,
      {
        name: 'Outros',
        value: otherValue
      }
    ];
  }

  // Ordena por quantidade de commits
  pieChartData = _.orderBy(pieChartData, ['value'], ['desc']);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = _.sumBy(pieChartData, 'value');
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 1.5, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {data.name}
          </Typography>
          <Typography variant="body2">
            {data.value} commits ({percentage}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1,
        justifyContent: 'center',
        px: 2
      }}>
        {payload.map((entry, index) => (
          <Box
            key={`legend-${index}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
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
            <Typography variant="caption" sx={{ maxWidth: isMobile ? 120 : 'none' }} noWrap>
              {entry.value}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday />
          Commits por Repositório ({currentDate.toLocaleString('pt-BR', { 
            month: 'long', 
            year: 'numeric' 
          })})
        </Typography>
      </Box>
      <Box sx={{ height: isMobile ? 250 : 300, display: 'flex', justifyContent: 'center' }}>
        {pieChartData.length > 0 ? (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 40 : 60}
                outerRadius={isMobile ? 70 : 80}
                fill="#8884d8"
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
              <Legend content={renderLegend} />
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