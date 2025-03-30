// Path: components\dashboard\RepoCommitsTable.jsx
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
import { GitHub, Search } from '@mui/icons-material';
import _ from 'lodash';
import PaginatedTable from './PaginatedTable';

const MAX_MESSAGE_LENGTH = 100;

function truncateMessage(message) {
  const firstLine = message.split('\n')[0];
  if (firstLine.length <= MAX_MESSAGE_LENGTH) return firstLine;
  return firstLine.substring(0, MAX_MESSAGE_LENGTH) + '...';
}

function RepoCommitsTable({ data }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const commitsByRepo = _.groupBy(data, 'repo');
    
    const processedRepos = Object.entries(commitsByRepo).map(([repo, commits]) => {
      const lastCommit = _.maxBy(commits, commit => new Date(commit.date));
      return {
        name: repo,
        lastCommitDate: lastCommit.date,
        totalCommits: commits.length,
        repoUrl: lastCommit.repoUrl
      };
    });

    const sortedRepos = _.orderBy(processedRepos, ['lastCommitDate'], ['desc']);
    setRepos(sortedRepos);

    if (!selectedRepo && sortedRepos.length > 0) {
      setSelectedRepo(sortedRepos[0].name);
    }
  }, [data]);

  const repoCommits = selectedRepo
    ? _.orderBy(
        data.filter(commit => commit.repo === selectedRepo),
        ['date'],
        ['desc']
      )
    : [];

  const columns = ['Autor', 'Mensagem', 'Data'];
  const columnWidths = ['20%', '60%', '20%'];

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
      <TableCell style={{ width: columnWidths[2] }}>{commit.date.toLocaleString('pt-BR')}</TableCell>
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
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {truncateMessage(commit.message)}
        </Link>
      </TableCell>
    </TableRow>
  );

  const renderRepoOption = (props, option) => {
    const { key, ...other } = props;
    const repo = repos.find(r => r.name === option);

    if (isMobile) {
      return (
        <Box component="li" key={key} {...other}>
          <Stack spacing={0.5} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GitHub fontSize="small" />
              <Typography variant="subtitle1" noWrap>{option}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {repo.totalCommits} commits
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Último: {new Date(repo.lastCommitDate).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          </Stack>
        </Box>
      );
    }

    return (
      <Box component="li" key={key} {...other} sx={{ padding: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GitHub fontSize="small" />
            <Typography>{option}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip 
              size="small" 
              label={`${repo.totalCommits} commits`}
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              Último: {new Date(repo.lastCommitDate).toLocaleDateString('pt-BR')}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <GitHub />
        Commits por Repositório
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Autocomplete
          value={selectedRepo}
          onChange={(event, newValue) => setSelectedRepo(newValue)}
          options={repos.map(repo => repo.name)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Buscar repositório..."
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
          renderOption={renderRepoOption}
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

      {selectedRepo && (
        <PaginatedTable
          data={repoCommits}
          columns={columns}
          columnWidths={columnWidths}
          renderRow={renderRow}
          renderMobileRow={renderMobileRow}
        />
      )}
    </Paper>
  );
}

export default RepoCommitsTable;