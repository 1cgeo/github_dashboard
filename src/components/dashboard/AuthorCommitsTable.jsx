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
import { Person, Search } from '@mui/icons-material';
import _ from 'lodash';

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
      ).slice(0, isMobile ? 5 : 10)
    : [];

  const renderMobileView = () => (
    <Box sx={{ mt: 2 }}>
      {authorCommits.map((commit) => (
        <Paper key={commit.sha} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
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
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Link href={commit.repoUrl} target="_blank" rel="noopener">
              <Chip 
                label={commit.repo} 
                size="small" 
                variant="outlined"
                sx={{ maxWidth: '100%' }}
              />
            </Link>
            <Typography variant="caption" color="text.secondary">
              {commit.date.toLocaleString('pt-BR')}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );

  const renderDesktopView = () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Mensagem</TableCell>
          <TableCell>Repositório</TableCell>
          <TableCell>Data</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {authorCommits.map((commit) => (
          <TableRow key={commit.sha}>
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
      <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Person />
        Commits por Autor {`(Últimos ${isMobile ? 5 : 10})`}
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
          renderOption={(props, option) => {
            const author = authors.find(a => a.name === option);
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
                  <Typography noWrap>{option}</Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
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
          }}
        />
      </Box>

      {selectedAuthor && (
        isMobile ? renderMobileView() : renderDesktopView()
      )}
    </Paper>
  );
}

export default AuthorCommitsTable;