import App from './app';
import JssProvider from 'react-jss/lib/JssProvider';
import React from 'react';
import ReactDOM from 'react-dom';
import less from 'react-syntax-highlighter/languages/hljs/less';
import theme from '@trevorblades/mui-theme';
import {
  MuiThemeProvider,
  createGenerateClassName,
  jssPreset
} from '@material-ui/core/styles';
import {create} from 'jss';
import {injectGlobal} from 'react-emotion';
import {registerLanguage} from 'react-syntax-highlighter/light';

const generateClassName = createGenerateClassName();
const jss = create(jssPreset());
// we define a custom insertion point that JSS will look for injecting the styles in the DOM
jss.options.insertionPoint = 'jss-insertion-point';

injectGlobal({
  [['html', 'body', '#root']]: {
    height: '100%'
  },
  code: {
    fontFamily: theme.typography.fontFamily
  }
});

registerLanguage('less', less);

ReactDOM.render(
  <JssProvider jss={jss} generateClassName={generateClassName}>
    <MuiThemeProvider theme={theme}>
      <App />
    </MuiThemeProvider>
  </JssProvider>,
  document.getElementById('root')
);
