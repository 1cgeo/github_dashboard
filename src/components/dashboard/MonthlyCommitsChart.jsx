import React, { useMemo } from 'react';
import { Paper, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { BarChart as BarChartIcon } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import _ from 'lodash';

function MonthlyCommitsChart({ data }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const chartData = useMemo(() => {
    const last12Months = Array.from({length: 12}, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        label: date.toLocaleString('pt-BR', { 
          month: isMobile ? 'short' : 'long', 
          year: 'numeric' 
        }),
        fullLabel: date.toLocaleString('pt-BR', { 
          month: 'long', 
          year: 'numeric' 
        })
      };
    }).reverse();

    return last12Months.map(({year, month, label, fullLabel}) => {
      const commits = data.filter(commit => {
        const commitDate = commit.date;
        return commitDate.getFullYear() === year && commitDate.getMonth() === month;
      }).length;
      
      return { 
        label, 
        fullLabel,
        commits 
      };
    });
  }, [data, isMobile]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const data = payload[0].payload;
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
            {data.fullLabel}
          </Typography>
          <Typography variant="body2">
            {data.commits} {data.commits === 1 ? 'commit' : 'commits'}
          </Typography>
        </Box>
      );
    }
    return null;
  };
  
  return (
    <Paper sx={{ 
      p: { xs: 1.5, sm: 2 },
      height: 'fit-content'
    }}>
      <Box sx={{ mb: 2 }}>
        <Typography 
          variant={isMobile ? "subtitle1" : "h6"} 
          component="div" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          <BarChartIcon sx={{ fontSize: { xs: '1.25rem', sm: 'inherit' } }} />
          Commits por Mês (12 meses)
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
        <BarChart 
          data={chartData}
          margin={{
            top: 5,
            right: isMobile ? 5 : 20,
            left: isMobile ? 5 : 20,
            bottom: isMobile ? 60 : 20
          }}
        >
          <XAxis 
            dataKey="label" 
            tick={{ 
              fontSize: isMobile ? 10 : 12,
              fill: theme.palette.text.primary
            }}
            interval={isMobile ? 1 : "preserveStartEnd"}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 60 : 30}
          />
          <YAxis 
            width={35}
            tick={{ 
              fontSize: isMobile ? 10 : 12,
              fill: theme.palette.text.primary
            }}
            tickFormatter={(value) => Math.floor(value)}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: theme.palette.action.hover }}
          />
          <Bar 
            dataKey="commits" 
            fill={theme.palette.primary.main}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default MonthlyCommitsChart;