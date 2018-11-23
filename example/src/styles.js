import theme from '@trevorblades/mui-theme';
import {injectGlobal} from 'react-emotion';

export default () =>
  injectGlobal({
    [['html', 'body', '#root']]: {
      height: '100%'
    },
    code: {
      fontFamily: theme.typography.fontFamily
    },
    // https://github.com/twitter/twemoji#inline-styles
    'img.emoji': {
      height: '1.25em',
      width: '1.25em',
      margin: '0 .05em 0 .1em',
      verticalAlign: '-0.2em'
    }
  });
