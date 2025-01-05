// src/components/dashboard/RepoCommitsTable.jsx
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
  Autocomplete,
  TextField,
  InputAdornment
} from '@mui/material';
import { GitHub, Search } from '@mui/icons-material';
import _ from 'lodash';

function RepoCommitsTable({ data }) {
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repos, setRepos] = useState([]);

  // Processa os dados dos repositórios
  useEffect(() => {
    const commitsByRepo = _.groupBy(data, 'repo');
    
    // Ordena repositórios pelo commit mais recente
    const processedRepos = Object.entries(commitsByRepo).map(([repo, commits]) => {
      const lastCommit = _.maxBy(commits, commit => new Date(commit.date));
      return {
        name: repo,
        lastCommitDate: lastCommit.date,
        totalCommits: commits.length,
        repoUrl: lastCommit.repoUrl // Todos os commits do mesmo repo têm a mesma URL
      };
    });

    // Ordena por data do último commit
    const sortedRepos = _.orderBy(processedRepos, ['lastCommitDate'], ['desc']);
    setRepos(sortedRepos);

    // Seleciona o primeiro repositório por padrão
    if (!selectedRepo && sortedRepos.length > 0) {
      setSelectedRepo(sortedRepos[0].name);
    }
  }, [data]);

  // Filtra commits do repositório selecionado
  const repoCommits = selectedRepo
    ? _.orderBy(
        data.filter(commit => commit.repo === selectedRepo),
        ['date'],
        ['desc']
      ).slice(0, 10)
    : [];

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <GitHub />
        Commits por Repositório
      </Typography>

      {/* Busca de repositórios */}
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
            const { key, ...otherProps } = props;
            return (
              <Box component="li" key={key} {...otherProps}>
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
                      Último: {repo.lastCommitDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          }}
        />
      </Box>

      {/* Tabela de commits */}
      {selectedRepo && (
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
                <TableCell>{commit.date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}

export default RepoCommitsTable;