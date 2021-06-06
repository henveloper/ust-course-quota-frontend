import React, { useMemo } from 'react';
import './App.css';
import { useAppContext } from './system/Container';
import { AppRouter } from './system/AppRouter';
import { createMuiTheme, CssBaseline, MuiThemeProvider, responsiveFontSizes } from '@material-ui/core';
import { Notistack } from './system/Notistack';

function App() {
  const context = useAppContext();
  const theme = useMemo(() => {
    return responsiveFontSizes(createMuiTheme({
      palette: {
        type: context.isDarkTheme ? 'dark' : 'light'
      }
    }));
  }, [ context.isDarkTheme ]);

  return <MuiThemeProvider theme={ theme }>
    <Notistack>
      <CssBaseline/>
      <AppRouter/>
    </Notistack>
  </MuiThemeProvider>;
}

export default App;
