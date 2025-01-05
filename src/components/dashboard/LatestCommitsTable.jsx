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
  Box
} from '@mui/material';
import { History } from '@mui/icons-material';
import _ from 'lodash';

function LatestCommitsTable({ data }) {
  const latestCommits = _.orderBy(data, ['date'], ['desc']).slice(0, 10);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <History />
        Últimos Commits
      </Typography>
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
              <TableCell>{commit.date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default LatestCommitsTable;