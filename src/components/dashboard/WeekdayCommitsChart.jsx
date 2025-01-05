import React from 'react';
import { Paper, Box, Typography, useTheme } from '@mui/material';
import { CalendarMonth } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Rectangle } from 'recharts';
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

  const commitsByDayOfWeek = _.groupBy(data, commit => 
    commit.date.toLocaleString('pt-BR', { weekday: 'long' }).toLowerCase()
  );

  const dayOfWeekData = weekDayOrder.map(day => ({
    name: day,
    commits: (commitsByDayOfWeek[day] || []).length
  }));

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonth />
          Commits por Dia da Semana
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dayOfWeekData}>
          <XAxis dataKey="name" />
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

export default WeekdayCommitsChart;