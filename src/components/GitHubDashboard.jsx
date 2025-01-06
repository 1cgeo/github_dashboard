// src/components/GitHubDashboard.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Container, Box, CircularProgress, Chip, useTheme, useMediaQuery } from '@mui/material';
import { Schedule } from '@mui/icons-material';
import commitData from '../data/commits.json';

// Componentes com lazy loading agrupados por funcionalidade
const DashboardHeader = lazy(() => import(/* webpackChunkName: "header" */ './dashboard/DashboardHeader'));
const StatsCards = lazy(() => import(/* webpackChunkName: "stats" */ './dashboard/StatsCards'));

// Gráficos de commits
const DailyCommitsChart = lazy(() => import(/* webpackChunkName: "daily-chart" */ './dashboard/DailyCommitsChart'));
const MonthlyCommitsChart = lazy(() => import(/* webpackChunkName: "monthly-chart" */ './dashboard/MonthlyCommitsChart'));
const WeekdayCommitsChart = lazy(() => import(/* webpackChunkName: "weekday-chart" */ './dashboard/WeekdayCommitsChart'));
const HourlyCommitsChart = lazy(() => import(/* webpackChunkName: "hourly-chart" */ './dashboard/HourlyCommitsChart'));

// Gráficos de pizza
const ReposPieChart = lazy(() => import(/* webpackChunkName: "repos-pie" */ './dashboard/ReposPieChart'));
const CurrentMonthPieChart = lazy(() => import(/* webpackChunkName: "month-pie" */ './dashboard/CurrentMonthPieChart'));

// Gráficos do mês atual
const CurrentMonthWeekdayChart = lazy(() => import(/* webpackChunkName: "month-weekday" */ './dashboard/CurrentMonthWeekdayChart'));
const CurrentMonthHourlyChart = lazy(() => import(/* webpackChunkName: "month-hourly" */ './dashboard/CurrentMonthHourlyChart'));

// Tabelas
const LatestCommitsTable = lazy(() => import(/* webpackChunkName: "latest-commits" */ './dashboard/LatestCommitsTable'));
const AuthorCommitsTable = lazy(() => import(/* webpackChunkName: "author-commits" */ './dashboard/AuthorCommitsTable'));
const RepoCommitsTable = lazy(() => import(/* webpackChunkName: "repo-commits" */ './dashboard/RepoCommitsTable'));

// Componente de loading reutilizável
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <CircularProgress />
  </Box>
);

// Componente wrapper para Suspense
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingComponent />}>
    {children}
  </Suspense>
);

function GitHubDashboard() {
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    try {
      const commits = commitData.commits.map(commit => ({
        ...commit,
        date: new Date(commit.date)
      }));
      setProcessedData(commits);
    } catch (error) {
      console.error('Error processing commit data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LoadingComponent />
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
        <SuspenseWrapper>
          <DashboardHeader />
        </SuspenseWrapper>
        <Chip 
          icon={<Schedule />} 
          label={`Atualizado: ${new Date(commitData.lastUpdate).toLocaleString('pt-BR')}`}
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          sx={{ maxWidth: '100%', wordBreak: 'break-word' }}
        />
      </Box>

      <SuspenseWrapper>
        <StatsCards data={processedData} />
      </SuspenseWrapper>

      <Box sx={{ mb: 3 }}>
        <SuspenseWrapper>
          <DailyCommitsChart data={processedData} />
        </SuspenseWrapper>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SuspenseWrapper>
          <LatestCommitsTable data={processedData} />
        </SuspenseWrapper>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SuspenseWrapper>
          <MonthlyCommitsChart data={processedData} />
        </SuspenseWrapper>
      </Box>
      
      <Box sx={{ 
        mb: 3,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 3
      }}>
        <SuspenseWrapper>
          <ReposPieChart data={processedData} />
        </SuspenseWrapper>
        <SuspenseWrapper>
          <CurrentMonthPieChart data={processedData} />
        </SuspenseWrapper>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <SuspenseWrapper>
          <AuthorCommitsTable data={processedData} />
        </SuspenseWrapper>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SuspenseWrapper>
          <RepoCommitsTable data={processedData} />
        </SuspenseWrapper>
      </Box>

      <Box sx={{ 
        mb: 3,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 3
      }}>
        <SuspenseWrapper>
          <WeekdayCommitsChart data={processedData} />
        </SuspenseWrapper>
        <SuspenseWrapper>
          <HourlyCommitsChart data={processedData} />
        </SuspenseWrapper>
      </Box>

      <Box sx={{ 
        mb: 3,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 3
      }}>
        <SuspenseWrapper>
          <CurrentMonthWeekdayChart data={processedData} />
        </SuspenseWrapper>
        <SuspenseWrapper>
          <CurrentMonthHourlyChart data={processedData} />
        </SuspenseWrapper>
      </Box>
    </Container>
  );
}

export default GitHubDashboard;