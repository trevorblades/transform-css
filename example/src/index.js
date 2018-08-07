import App from './app';
import CssBaseline from '@material-ui/core/CssBaseline';
import JssProvider from 'react-jss/lib/JssProvider';
import React from 'react';
import ReactDOM from 'react-dom';
import injectStyles from './styles';
import less from 'react-syntax-highlighter/languages/hljs/less';
import stylus from 'react-syntax-highlighter/languages/hljs/stylus';
import theme from '@trevorblades/mui-theme';
import {
  MuiThemeProvider,
  createGenerateClassName,
  jssPreset
} from '@material-ui/core/styles';
import {create} from 'jss';
import {registerLanguage} from 'react-syntax-highlighter/light';

const generateClassName = createGenerateClassName();
const jss = create(jssPreset());
// we define a custom insertion point that JSS will look for injecting the styles in the DOM
jss.options.insertionPoint = 'jss-insertion-point';

injectStyles();

registerLanguage('less', less);
registerLanguage('stylus', stylus);

ReactDOM.render(
  <JssProvider jss={jss} generateClassName={generateClassName}>
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </MuiThemeProvider>
  </JssProvider>,
  document.getElementById('root')
);
