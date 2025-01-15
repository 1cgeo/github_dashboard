import React, { useMemo } from 'react';
import { Paper, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const timeRanges = [
  { label: '00h - 08h', start: 0, end: 8 },
  { label: '08h - 13h', start: 8, end: 13 },
  { label: '13h - 17h', start: 13, end: 17 },
  { label: '17h - 00h', start: 17, end: 24 }
];

function CurrentMonthHourlyChart({ data }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const currentMonth = new Date().toLocaleString('pt-BR', { 
    month: 'long',
    timeZone: 'America/Sao_Paulo' 
  });

  const chartData = useMemo(() => {
    // Filtrar commits do mês atual usando o timezone de Brasília
    const currentMonthCommits = data.filter(commit => {
      const commitDate = new Date(commit.date).toLocaleString('en-US', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: 'numeric'
      });
      const nowDate = new Date().toLocaleString('en-US', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: 'numeric'
      });
      
      return commitDate === nowDate;
    });

    return timeRanges.map(range => {
      const commits = currentMonthCommits.filter(commit => {
        const hour = new Date(commit.date).toLocaleString('en-US', {
          timeZone: 'America/Sao_Paulo',
          hour: 'numeric',
          hour12: false
        });
        const brasiliaHour = parseInt(hour);
        return brasiliaHour >= range.start && brasiliaHour < range.end;
      });

      return {
        range: range.label,
        commits: commits.length
      };
    });
  }, [data]);

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
            {data.range}
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
          <AccessTime sx={{ fontSize: { xs: '1.25rem', sm: 'inherit' } }} />
          Commits por Horário ({currentMonth})
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
            dataKey="range"
            tick={{ 
              fontSize: isMobile ? 10 : 12,
              fill: theme.palette.text.primary
            }}
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

export default CurrentMonthHourlyChart;