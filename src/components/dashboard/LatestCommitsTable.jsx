// Path: components\dashboard\LatestCommitsTable.jsx
import React from 'react';
import { 
  Paper, 
  Typography,
  Link,
  Chip,
  TableCell,
  TableRow,
  Box
} from '@mui/material';
import { History } from '@mui/icons-material';
import _ from 'lodash';
import PaginatedTable from './PaginatedTable';

const MAX_MESSAGE_LENGTH = 100;

function truncateMessage(message) {
  const firstLine = message.split('\n')[0];
  if (firstLine.length <= MAX_MESSAGE_LENGTH) return firstLine;
  return firstLine.substring(0, MAX_MESSAGE_LENGTH) + '...';
}

function LatestCommitsTable({ data }) {
  const sortedCommits = _.orderBy(data, ['date'], ['desc']);

  const columns = ['Autor', 'Mensagem', 'Repositório', 'Data'];
  const columnWidths = ['150px', '45%', '25%', '150px'];

  const renderRow = (commit, index) => (
    <TableRow key={index}>
      <TableCell style={{ width: columnWidths[0] }}>{commit.author}</TableCell>
      <TableCell style={{ width: columnWidths[1] }}>
        <Link 
          href={commit.htmlUrl} 
          target="_blank" 
          rel="noopener" 
          title={commit.message.split('\n')[0]}
          sx={{ 
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {truncateMessage(commit.message)}
        </Link>
      </TableCell>
      <TableCell style={{ width: columnWidths[2] }}>
        <Link href={commit.repoUrl} target="_blank" rel="noopener">
          <Chip label={commit.repo} size="small" variant="outlined" />
        </Link>
      </TableCell>
      <TableCell style={{ width: columnWidths[3] }}>{commit.date.toLocaleString('pt-BR')}</TableCell>
    </TableRow>
  );

  const renderMobileRow = (commit, index, style) => (
    <TableRow key={index} sx={{ backgroundColor: style.backgroundColor }}>
      <TableCell sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>{commit.author}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            {commit.date.toLocaleString('pt-BR')}
          </Typography>
        </Box>
        <Link 
          href={commit.htmlUrl} 
          target="_blank" 
          rel="noopener"
          title={commit.message.split('\n')[0]}
          sx={{ 
            display: 'block',
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {truncateMessage(commit.message)}
        </Link>
        <Link href={commit.repoUrl} target="_blank" rel="noopener">
          <Chip 
            label={commit.repo} 
            size="small" 
            variant="outlined" 
            sx={{ maxWidth: '100%', overflow: 'hidden' }}
          />
        </Link>
      </TableCell>
    </TableRow>
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <History />
        Últimos Commits
      </Typography>
      <PaginatedTable
        data={sortedCommits}
        columns={columns}
        columnWidths={columnWidths}
        renderRow={renderRow}
        renderMobileRow={renderMobileRow}
      />
    </Paper>
  );
}

export default LatestCommitsTable;