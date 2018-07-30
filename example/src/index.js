import App from './app';
import React from 'react';
import ReactDOM from 'react-dom';
import theme from '@trevorblades/mui-theme';
import {MuiThemeProvider} from '@material-ui/core/styles';

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <App />
  </MuiThemeProvider>,
  document.getElementById('root')
);
