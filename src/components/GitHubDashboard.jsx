// src/components/GitHubDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Chip } from '@mui/material';
import { Schedule } from '@mui/icons-material';
import commitData from '../data/commits.json';

import DashboardHeader from './dashboard/DashboardHeader';
import StatsCards from './dashboard/StatsCards';
import MonthlyCommitsChart from './dashboard/MonthlyCommitsChart';
import ReposPieChart from './dashboard/ReposPieChart';
import WeekdayCommitsChart from './dashboard/WeekdayCommitsChart';
import DailyCommitsChart from './dashboard/DailyCommitsChart';
import LatestCommitsTable from './dashboard/LatestCommitsTable';
import AuthorCommitsTable from './dashboard/AuthorCommitsTable';
import RepoCommitsTable from './dashboard/RepoCommitsTable';
import CurrentMonthPieChart from './dashboard/CurrentMonthPieChart';

function GitHubDashboard() {
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <DashboardHeader />
        <Chip 
          icon={<Schedule />} 
          label={`Dados atualizados em: ${new Date(commitData.lastUpdate).toLocaleString('pt-BR')}`}
          variant="outlined"
        />
      </Box>

      <StatsCards data={processedData} />
      
      <Box sx={{ mb: 3 }}>
        <MonthlyCommitsChart data={processedData} />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <ReposPieChart data={processedData} />
        <CurrentMonthPieChart data={processedData} />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <WeekdayCommitsChart data={processedData} />
        <DailyCommitsChart data={processedData} />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <LatestCommitsTable data={processedData} />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <AuthorCommitsTable data={processedData} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <RepoCommitsTable data={processedData} />
      </Box>
    </Container>
  );
}

export default GitHubDashboard;