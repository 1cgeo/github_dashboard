// Path: App.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import GitHubDashboard from './components/GitHubDashboard';
import ThemeToggle from './components/ThemeToggle';

function App() {
  // Inicializa o tema usando localStorage ou preferência do sistema
  const [mode, setMode] = useState(() => {
    // Primeiro, tenta pegar do localStorage
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      return savedMode;
    }
    
    // Se não houver preferência salva, usa a preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Salva a preferência no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Escuta mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Só atualiza se não houver preferência salva
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#2196f3'
          },
          ...(mode === 'dark' ? {
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
          } : {
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
          }),
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                transition: 'background-color 0.3s ease-in-out',
              },
            },
          },
        },
      }),
    [mode],
  );

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GitHubDashboard />
      <ThemeToggle toggleColorMode={toggleColorMode} />
    </ThemeProvider>
  );
}

export default App;