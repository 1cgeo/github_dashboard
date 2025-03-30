// Path: components\dashboard\WeekdayCommitsChart.jsx
import React, { useMemo } from 'react';
import { Paper, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { CalendarMonth } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import _ from 'lodash';

const weekDayOrder = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado'
];

function WeekdayCommitsChart({ data }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const chartData = useMemo(() => {
    const commitsByDayOfWeek = _.groupBy(data, commit =>
      commit.date.toLocaleString('pt-BR', { weekday: 'long' }).toLowerCase()
    );

    return weekDayOrder.map(day => ({
      day: isMobile ? day.slice(0, 3) : day, // Abreviação para mobile
      fullDay: day,
      commits: (commitsByDayOfWeek[day] || []).length
    }));
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
            {data.fullDay}
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
          <CalendarMonth sx={{ fontSize: { xs: '1.25rem', sm: 'inherit' } }} />
          Commits por Dia da Semana
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
        <BarChart 
          data={chartData}
          margin={{
            top: 5,
            right: isMobile ? 5 : 20,
            left: isMobile ? 5 : 20,
            bottom: isMobile ? 20 : 5
          }}
        >
          <XAxis 
            dataKey="day"
            tick={{ 
              fontSize: isMobile ? 10 : 12,
              fill: theme.palette.text.primary
            }}
            interval={0}
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

export default WeekdayCommitsChart;