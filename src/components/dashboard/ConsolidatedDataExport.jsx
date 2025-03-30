// Path: components\dashboard\ConsolidatedDataExport.jsx
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { Assessment } from '@mui/icons-material';
import _ from 'lodash';

function ConsolidatedDataExport({ data }) {
  const [open, setOpen] = useState(false);
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());

  // Get available years and months from data
  const years = _.uniq(data.map(commit => commit.date.getFullYear()))
    .filter(year => year >= 2022)
    .sort((a, b) => b - a);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })
  }));

  const handleExport = () => {
    // Filter commits for selected period
    const periodCommits = data.filter(commit => {
      const commitDate = commit.date;
      return commitDate.getFullYear() === year && commitDate.getMonth() === month;
    });

    // Group by repository
    const commitsByRepo = _.groupBy(periodCommits, 'repo');

    // Prepare CSV data and sort by number of commits
    const csvData = Object.entries(commitsByRepo)
      .map(([repo, commits]) => {
      const authors = _.uniq(commits.map(c => c.author)).join(';');
      return {
        Repositório: repo,
        'Número de commits': commits.length,
        Efetivo: authors
      };
    });

    // Convert to CSV string
    const headers = ['Repositório', 'Número de commits', 'Efetivo'];
    let csvString = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    // Sort CSV rows by number of commits (excluding header)
    const [headerRow, ...dataRows] = csvString.split('\n');
    const sortedRows = dataRows.sort((a, b) => {
      const commitsA = parseInt(a.split(',')[1]);
      const commitsB = parseInt(b.split(',')[1]);
      return commitsB - commitsA;
    });

    csvString = [headerRow, ...sortedRows].join('\n');

    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `commits_${year}_${String(month + 1).padStart(2, '0')}.csv`;
    link.click();
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<Assessment />}
        onClick={() => setOpen(true)}
        sx={{ mt: 2 }}
      >
        Dados Consolidados
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Exportar Dados Consolidados</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Ano</InputLabel>
              <Select
                value={year}
                label="Ano"
                onChange={(e) => setYear(e.target.value)}
              >
                {years.map((yearOption) => {
                  const currentDate = new Date();
                  const isDisabled = yearOption > currentDate.getFullYear();
                  return (
                    <MenuItem 
                      key={yearOption} 
                      value={yearOption}
                      disabled={isDisabled}
                    >
                      {yearOption}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Mês</InputLabel>
              <Select
                value={month}
                label="Mês"
                onChange={(e) => setMonth(e.target.value)}
              >
                {months.map(({ value, label }) => {
                  const isDisabled = year === currentDate.getFullYear() && value > currentDate.getMonth();
                  return (
                    <MenuItem 
                      key={value} 
                      value={value}
                      disabled={isDisabled}
                    >
                      {label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleExport}
            disabled={!year || month === ''}
          >
            Exportar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ConsolidatedDataExport;