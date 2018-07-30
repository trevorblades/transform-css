import App from './app';
import React from 'react';
import ReactDOM from 'react-dom';
import theme from '@trevorblades/mui-theme';
import {MuiThemeProvider} from '@material-ui/core/styles';
import {injectGlobal} from 'react-emotion';

injectGlobal({
  [['html', 'body', '#root']]: {
    height: '100%'
  }
});

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <App />
  </MuiThemeProvider>,
  document.getElementById('root')
);
