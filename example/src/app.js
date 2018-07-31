import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import GitHubLogo from 'react-icons/lib/fa/github';
import React, {Component, Fragment} from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/light';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import outdent from 'outdent/lib';
import styled from 'react-emotion';
import theme from '@trevorblades/mui-theme';
import transformCss from '../../lib';
import {hot} from 'react-hot-loader';
import {atomOneDark} from 'react-syntax-highlighter/styles/hljs';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
});

const GitHubLink = styled.a({
  marginLeft: 'auto',
  color: 'inherit'
});

const Content = styled.div({
  display: 'flex',
  flexGrow: 1
});

const padding = theme.spacing.unit * 3;
const {fontFamily, fontSize, body1} = theme.typography;
const {lineHeight} = body1;
const Input = styled.textarea({
  width: '50%',
  padding,
  border: 'none',
  fontFamily,
  fontSize,
  lineHeight,
  outline: 'none'
});

const Output = styled(SyntaxHighlighter)({
  flexGrow: 1,
  margin: 0,
  backgroundColor: theme.palette.grey[100],
  fontSize,
  lineHeight
});

class App extends Component {
  constructor(props) {
    super(props);

    const input = outdent`
      #id {
        width: 420px;
        color: green;
      }

      #id .child-class {
        overflow: hidden;
      }

      #id .child-class p {
        margin: 0 1em;
      }

      #id .child-class p:last-child {
        margin-bottom: 0;
      }
    `;

    this.state = {
      input,
      output: transformCss(input)
    };
  }

  onChange = event => {
    const input = event.target.value;
    this.setState({
      input,
      output: transformCss(input)
    });
  };

  onKeyDown(event) {
    // cause the tab key to print tabs
    if (event.keyCode === 9) {
      const start = event.target.selectionStart;
      const {value} = event.target;
      event.target.value =
        value.substring(0, start) +
        '\t' +
        value.substring(event.target.selectionEnd);
      event.target.selectionStart = event.target.selectionEnd = start + 1;
      event.preventDefault();
    }
  }

  render() {
    return (
      <Fragment>
        <CssBaseline />
        <Container>
          <AppBar position="static" elevation={0}>
            <Toolbar>
              <Typography variant="title" color="inherit">
                🐠 transform-css
              </Typography>
              <Tooltip title="View on GitHub">
                <GitHubLink
                  href="https://github.com/trevorblades/transform-css"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHubLogo size={32} />
                </GitHubLink>
              </Tooltip>
            </Toolbar>
          </AppBar>
          <Content>
            <Input
              spellCheck={false}
              value={this.state.input}
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
            />
            <Output language="less" style={atomOneDark} customStyle={{padding}}>
              {this.state.output}
            </Output>
          </Content>
        </Container>
      </Fragment>
    );
  }
}

export default hot(module)(App);
