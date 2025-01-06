// src/components/GitHubDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Chip, useTheme, useMediaQuery } from '@mui/material';
import { Schedule } from '@mui/icons-material';
import commitData from '../data/commits.json';

import DashboardHeader from './dashboard/DashboardHeader';
import StatsCards from './dashboard/StatsCards';
import MonthlyCommitsChart from './dashboard/MonthlyCommitsChart';
import ReposPieChart from './dashboard/ReposPieChart';
import WeekdayCommitsChart from './dashboard/WeekdayCommitsChart';
import HourlyCommitsChart from './dashboard/HourlyCommitsChart';
import DailyCommitsChart from './dashboard/DailyCommitsChart';
import LatestCommitsTable from './dashboard/LatestCommitsTable';
import AuthorCommitsTable from './dashboard/AuthorCommitsTable';
import RepoCommitsTable from './dashboard/RepoCommitsTable';
import CurrentMonthPieChart from './dashboard/CurrentMonthPieChart';
import CurrentMonthWeekdayChart from './dashboard/CurrentMonthWeekdayChart';
import CurrentMonthHourlyChart from './dashboard/CurrentMonthHourlyChart';

function GitHubDashboard() {
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const commits = commitData.commits.map(commit => ({
      ...commit,
      date: new Date(commit.date)
    }));
    setProcessedData(commits);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: isMobile ? 1 : 2 }}>
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 2
      }}>
        <DashboardHeader />
        <Chip 
          icon={<Schedule />} 
          label={`Atualizado: ${new Date(commitData.lastUpdate).toLocaleString('pt-BR')}`}
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          sx={{ maxWidth: '100%', wordBreak: 'break-word' }}
        />
      </Box>

      <StatsCards data={processedData} />

      <Box sx={{ mb: 3 }}>
        <DailyCommitsChart data={processedData} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <LatestCommitsTable data={processedData} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <MonthlyCommitsChart data={processedData} />
      </Box>
      
      <Box sx={{ 
        mb: 3,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 3
      }}>
        <ReposPieChart data={processedData} />
        <CurrentMonthPieChart data={processedData} />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <AuthorCommitsTable data={processedData} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <RepoCommitsTable data={processedData} />
      </Box>

      <Box sx={{ 
        mb: 3,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 3
      }}>
        <WeekdayCommitsChart data={processedData} />
        <HourlyCommitsChart data={processedData} />
      </Box>

      <Box sx={{ 
        mb: 3,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 3
      }}>
        <CurrentMonthWeekdayChart data={processedData} />
        <CurrentMonthHourlyChart data={processedData} />
      </Box>

    </Container>
  );
}

export default GitHubDashboard;