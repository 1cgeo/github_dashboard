import React from 'react';
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

  const commitsByDayOfWeek = _.groupBy(data, commit => 
    commit.date.toLocaleString('pt-BR', { weekday: 'long' }).toLowerCase()
  );

  const dayOfWeekData = weekDayOrder.map(day => ({
    day: isMobile ? day.slice(0, 3) : day, // Abreviação para mobile
    fullDay: day,
    commits: (commitsByDayOfWeek[day] || []).length
  }));

  const CustomTooltip = ({ active, payload, label }) => {
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
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {data.fullDay}
          </Typography>
          <Typography variant="body2">
            {data.commits} commits
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
          <CalendarMonth />
          Commits por Dia da Semana
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={dayOfWeekData}
          margin={isMobile ? { left: 0, right: 0 } : { left: 20, right: 20 }}
        >
          <XAxis 
            dataKey="day"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            interval={0}
          />
          <YAxis 
            width={isMobile ? 30 : 40}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="commits" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default WeekdayCommitsChart;