import theme from '@trevorblades/mui-theme';
import {injectGlobal} from 'react-emotion';

export default () =>
  injectGlobal({
    [['html', 'body', '#root']]: {
      height: '100%'
    },
    code: {
      fontFamily: theme.typography.fontFamily
    }
  });
