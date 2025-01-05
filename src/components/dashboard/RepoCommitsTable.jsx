import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  Box,
  Link,
  Chip,
  TextField,
  InputAdornment,
  Autocomplete,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { GitHub, Search } from '@mui/icons-material';
import _ from 'lodash';

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
      ).slice(0, isMobile ? 5 : 10)
    : [];

  const renderMobileView = () => (
    <Box sx={{ mt: 2 }}>
      {repoCommits.map((commit, index) => (
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
          <TableCell>Data</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {repoCommits.map((commit, idx) => (
          <TableRow key={idx}>
            <TableCell>{commit.author}</TableCell>
            <TableCell>
              <Link href={commit.htmlUrl} target="_blank" rel="noopener">
                {commit.message.split('\n')[0]}
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
      <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <GitHub />
        Commits por Repositório {selectedRepo && `(Últimos ${isMobile ? 5 : 10})`}
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
          renderOption={(props, option) => {
            const repo = repos.find(r => r.name === option);
            return (
              <Box
                key={props.key}
                component="li"
                {...Object.fromEntries(Object.entries(props).filter(([key]) => key !== 'key'))}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between', 
                  width: '100%', 
                  gap: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GitHub fontSize="small" />
                    <Typography noWrap>{option}</Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
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
          }}
        />
      </Box>

      {selectedRepo && (
        isMobile ? renderMobileView() : renderDesktopView()
      )}
    </Paper>
  );
}

export default RepoCommitsTable;