// src/components/dashboard/LatestCommitsTable.jsx
import React from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  Link,
  Chip,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { History } from '@mui/icons-material';
import _ from 'lodash';

function LatestCommitsTable({ data }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const latestCommits = _.orderBy(data, ['date'], ['desc']).slice(0, isMobile ? 5 : 10);

  const renderMobileView = () => (
    <Box sx={{ mt: 2 }}>
      {latestCommits.map((commit, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {commit.author} • {commit.date.toLocaleString('pt-BR')}
          </Typography>
          
          <Link 
            href={commit.htmlUrl} 
            target="_blank" 
            rel="noopener"
            sx={{ 
              display: 'block',
              mb: 1,
              wordBreak: 'break-word'
            }}
          >
            {commit.message.split('\n')[0]}
          </Link>
          
          <Link href={commit.repoUrl} target="_blank" rel="noopener">
            <Chip 
              label={commit.repo} 
              size="small" 
              variant="outlined"
              sx={{ maxWidth: '100%' }}
            />
          </Link>
        </Paper>
      ))}
    </Box>
  );

  const renderDesktopView = () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Autor</TableCell>
          <TableCell>Mensagem</TableCell>
          <TableCell>Repositório</TableCell>
          <TableCell>Data</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {latestCommits.map((commit, index) => (
          <TableRow key={index}>
            <TableCell>{commit.author}</TableCell>
            <TableCell>
              <Link href={commit.htmlUrl} target="_blank" rel="noopener">
                {commit.message.split('\n')[0]}
              </Link>
            </TableCell>
            <TableCell>
              <Link href={commit.repoUrl} target="_blank" rel="noopener">
                <Chip label={commit.repo} size="small" variant="outlined" />
              </Link>
            </TableCell>
            <TableCell>{commit.date.toLocaleString('pt-BR')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <History />
        {`Últimos ${isMobile ? 5 : 10} Commits`}
      </Typography>
      {isMobile ? renderMobileView() : renderDesktopView()}
    </Paper>
  );
}

export default LatestCommitsTable;