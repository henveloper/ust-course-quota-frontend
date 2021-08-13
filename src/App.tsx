import React, { useMemo } from "react";
import "./App.css";
import { useAppContext } from "./system/Container";
import { AppRouter } from "./system/AppRouter";
import {
  createTheme,
  CssBaseline,
  MuiThemeProvider,
  responsiveFontSizes,
} from "@material-ui/core";
import { Notistack } from "./system/Notistack";
import { Chart, registerables } from "chart.js";
import "chartjs-adapter-date-fns";
Chart.register(...registerables);

function App() {
  const context = useAppContext();
  const theme = useMemo(() => {
    return responsiveFontSizes(
      createTheme({
        palette: {
          type: context.isDarkTheme ? "dark" : "light",
        },
      })
    );
  }, [context.isDarkTheme]);

  return (
    <MuiThemeProvider theme={theme}>
      <Notistack>
        <CssBaseline />
        <AppRouter />
      </Notistack>
    </MuiThemeProvider>
  );
}

export default App;
