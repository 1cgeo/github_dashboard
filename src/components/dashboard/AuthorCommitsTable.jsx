// src/components/dashboard/AuthorCommitsTable.jsx
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
  Tabs,
  Tab,
  Link,
  Chip,
  TextField,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import { Person, Search } from '@mui/icons-material';
import _ from 'lodash';

function AuthorCommitsTable({ data }) {
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [authors, setAuthors] = useState([]);

  // Processa os dados dos autores
  useEffect(() => {
    const commitsByAuthor = _.groupBy(data, 'author');
    
    // Ordena autores pelo commit mais recente
    const processedAuthors = Object.entries(commitsByAuthor).map(([author, commits]) => {
      const lastCommit = _.maxBy(commits, commit => new Date(commit.date));
      return {
        name: author,
        lastCommitDate: lastCommit.date,
        totalCommits: commits.length
      };
    });

    // Ordena por data do último commit
    const sortedAuthors = _.orderBy(processedAuthors, ['lastCommitDate'], ['desc']);
    setAuthors(sortedAuthors);

    // Seleciona o primeiro autor por padrão
    if (!selectedAuthor && sortedAuthors.length > 0) {
      setSelectedAuthor(sortedAuthors[0].name);
    }
  }, [data]);

  // Filtra commits do autor selecionado
  const authorCommits = selectedAuthor
    ? _.orderBy(
        data.filter(commit => commit.author === selectedAuthor),
        ['date'],
        ['desc']
      ).slice(0, 10)
    : [];

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Person />
        Commits por Autor
      </Typography>

      {/* Busca de autores */}
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
          renderOption={(props, option) => {
            const author = authors.find(a => a.name === option);
            const { key, ...otherProps } = props;
            return (
              <Box component="li" key={key} {...otherProps}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Typography>{option}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip 
                      size="small" 
                      label={`${author.totalCommits} commits`}
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Último: {author.lastCommitDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          }}
        />
      </Box>

      {/* Tabela de commits */}
      {selectedAuthor && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mensagem</TableCell>
              <TableCell>Repositório</TableCell>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {authorCommits.map((commit, idx) => (
              <TableRow key={idx}>
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
      )}
    </Paper>
  );
}

export default AuthorCommitsTable;