import React from 'react';
import { Paper, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Timeline } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import _ from 'lodash';

function DailyCommitsChart({ data }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Reduz para 15 dias em dispositivos móveis
  const daysToShow = isMobile ? 15 : 30;

  const last30Days = Array.from({length: daysToShow}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const commitsByDate = _.groupBy(data, commit => 
    commit.date.toISOString().split('T')[0]
  );

  const dailyCommitData = last30Days.map(date => {
    const displayDate = new Date(date).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: isMobile ? 'numeric' : 'short'
    });

    return {
      date: displayDate,
      fullDate: new Date(date).toLocaleDateString('pt-BR'),
      commits: (commitsByDate[date] || []).length
    };
  });

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
            {data.fullDate}
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
          <Timeline />
          Commits por Dia (Últimos {daysToShow} dias)
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={dailyCommitData}
          margin={isMobile ? { left: 0, right: 0 } : { left: 20, right: 20 }}
        >
          <XAxis 
            dataKey="date"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            interval={isMobile ? 2 : 6}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 50 : 30}
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

export default DailyCommitsChart;