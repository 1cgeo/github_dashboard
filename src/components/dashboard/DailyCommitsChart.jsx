import React, { useMemo } from 'react';
import { Paper, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Timeline } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import _ from 'lodash';
import { getLastNDaysInBrasilia, groupCommitsByBrasiliaDate } from '../../utils/dateUtils';

function DailyCommitsChart({ data }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const viewportConfig = useMemo(() => ({
    daysToShow: isMobile ? 10 : isTablet ? 20 : 30,
    axisInterval: isMobile ? 3 : isTablet ? 4 : 6,
    height: isMobile ? 250 : isTablet ? 280 : 300,
    dateFormat: {
      day: 'numeric',
      month: isMobile ? 'numeric' : isTablet ? 'short' : 'long',
      timeZone: 'America/Sao_Paulo'
    }
  }), [isMobile, isTablet]);

  const chartData = useMemo(() => {
    const lastDays = getLastNDaysInBrasilia(viewportConfig.daysToShow);
    const commitsByDate = groupCommitsByBrasiliaDate(data);

    return lastDays.map(({ isoDate, displayDate, fullDate }) => ({
      date: displayDate,
      fullDate,
      commits: (commitsByDate[isoDate] || []).length
    }));
  }, [data, viewportConfig.daysToShow]);

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
            {data.fullDate}
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
      p: { xs: 1.5, sm: 2, md: 3 },
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
          <Timeline sx={{ 
            fontSize: { 
              xs: '1.25rem', 
              sm: 'inherit',
              md: '1.5rem' 
            } 
          }} />
          Commits por Dia (Últimos {viewportConfig.daysToShow} dias)
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={viewportConfig.height}>
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: isMobile ? 5 : isTablet ? 15 : 20,
            left: isMobile ? 5 : isTablet ? 15 : 20,
            bottom: isMobile ? 45 : isTablet ? 35 : 20
          }}
        >
          <XAxis
            dataKey="date"
            tick={{
              fontSize: isMobile ? 10 : 12,
              fill: theme.palette.text.primary
            }}
            interval={viewportConfig.axisInterval}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 60 : 30}
            tickMargin={isMobile ? 15 : 5}
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

export default DailyCommitsChart;