// src/components/dashboard/AuthorCommitsTable.jsx
import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography,
  Box,
  Link,
  Chip,
  TextField,
  InputAdornment,
  Autocomplete,
  TableCell,
  TableRow,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { Person, Search } from '@mui/icons-material';
import _ from 'lodash';
import PaginatedTable from './PaginatedTable';

const MAX_MESSAGE_LENGTH = 100;

function truncateMessage(message) {
  const firstLine = message.split('\n')[0];
  if (firstLine.length <= MAX_MESSAGE_LENGTH) return firstLine;
  return firstLine.substring(0, MAX_MESSAGE_LENGTH) + '...';
}

function AuthorCommitsTable({ data }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    const commitsByAuthor = _.groupBy(data, 'author');
    
    const processedAuthors = Object.entries(commitsByAuthor).map(([author, commits]) => {
      const lastCommit = _.maxBy(commits, commit => new Date(commit.date));
      return {
        name: author,
        lastCommitDate: lastCommit.date,
        totalCommits: commits.length
      };
    });

    const sortedAuthors = _.orderBy(processedAuthors, ['lastCommitDate'], ['desc']);
    setAuthors(sortedAuthors);

    if (!selectedAuthor && sortedAuthors.length > 0) {
      setSelectedAuthor(sortedAuthors[0].name);
    }
  }, [data]);

  const authorCommits = selectedAuthor
    ? _.orderBy(
        data.filter(commit => commit.author === selectedAuthor),
        ['date'],
        ['desc']
      )
    : [];

  const columns = ['Mensagem', 'Repositório', 'Data'];
  const columnWidths = ['50%', '30%', '20%'];

  const renderRow = (commit, index) => (
    <TableRow key={index}>
      <TableCell style={{ width: columnWidths[0] }}>
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
      <TableCell style={{ width: columnWidths[1] }}>
        <Link href={commit.repoUrl} target="_blank" rel="noopener">
          <Chip label={commit.repo} size="small" variant="outlined" />
        </Link>
      </TableCell>
      <TableCell style={{ width: columnWidths[2] }}>{commit.date.toLocaleString('pt-BR')}</TableCell>
    </TableRow>
  );

  const renderMobileRow = (commit, index, style) => (
    <TableRow key={index} sx={{ backgroundColor: style.backgroundColor }}>
      <TableCell sx={{ p: 2 }}>
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href={commit.repoUrl} target="_blank" rel="noopener">
            <Chip 
              label={commit.repo} 
              size="small" 
              variant="outlined"
              sx={{ maxWidth: '100%', overflow: 'hidden' }}
            />
          </Link>
          <Typography variant="caption" color="text.secondary">
            {commit.date.toLocaleString('pt-BR')}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderAuthorOption = (props, option) => {
    const { key, ...other } = props;
    const author = authors.find(a => a.name === option);

    if (isMobile) {
      return (
        <Box component="li" key={key} {...other}>
          <Stack spacing={0.5} sx={{ p: 2 }}>
            <Typography variant="subtitle1" noWrap>{option}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {author.totalCommits} commits
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Último: {new Date(author.lastCommitDate).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          </Stack>
        </Box>
      );
    }

    return (
      <Box component="li" key={key} {...other} sx={{ padding: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Typography>{option}</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip 
              size="small" 
              label={`${author.totalCommits} commits`}
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              Último: {new Date(author.lastCommitDate).toLocaleDateString('pt-BR')}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Person />
        Commits por Autor
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Autocomplete
          value={selectedAuthor}
          onChange={(event, newValue) => setSelectedAuthor(newValue)}
          options={authors.map(author => author.name)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Buscar autor..."
              variant="outlined"
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          )}
          renderOption={renderAuthorOption}
          ListboxProps={{
            sx: {
              '& li': {
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none'
                }
              }
            }
          }}
        />
      </Box>

      {selectedAuthor && (
        <PaginatedTable
          data={authorCommits}
          columns={columns}
          columnWidths={columnWidths}
          renderRow={renderRow}
          renderMobileRow={renderMobileRow}
        />
      )}
    </Paper>
  );
}

export default AuthorCommitsTable;