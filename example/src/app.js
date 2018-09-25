import AppBar from '@material-ui/core/AppBar';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import GitHubLogo from 'react-icons/lib/fa/github';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import React, {Component, Fragment} from 'react';
import Switch from '@material-ui/core/Switch';
import SyntaxHighlighter from 'react-syntax-highlighter/light';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import TwitterLogo from 'react-icons/lib/fa/twitter';
import Typography from '@material-ui/core/Typography';
import outdent from 'outdent/lib';
import select from 'select';
import styled from 'react-emotion';
import theme from '@trevorblades/mui-theme';
import transformCss from '../../lib';
import withProps from 'recompose/withProps';
import {atomOneDark} from 'react-syntax-highlighter/styles/hljs';
import {hot} from 'react-hot-loader';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
});

const Heading = withProps({
  variant: 'title',
  color: 'inherit'
})(
  styled(Typography)({
    marginRight: 'auto'
  })
);

const MenuItem = withProps({
  color: 'inherit',
  component: 'a',
  target: 'blank',
  rel: 'noopener noreferrer'
})(
  styled(IconButton)({
    ':not(:last-child)': {
      marginRight: theme.spacing.unit
    }
  })
);

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
  outline: 'none',
  resize: 'none'
});

const Output = styled.div({
  flexGrow: 1,
  position: 'relative'
});

const StyledSyntaxHighlighter = styled(SyntaxHighlighter)({
  flexGrow: 1,
  height: '100%',
  margin: 0,
  fontSize,
  lineHeight
});

const Options = styled(Paper)({
  paddingLeft: theme.spacing.unit * 2,
  position: 'absolute',
  bottom: padding,
  right: padding
});

class App extends Component {
  state = {
    omit: false,
    spaces: true,
    input: outdent`
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
    `
  };

  onInputKeyDown(event) {
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

  onInputChange = event => this.setState({input: event.target.value});

  onSwitchChange = event =>
    this.setState({[event.target.name]: event.target.checked});

  onOutputClick = event => select(event.currentTarget);

  render() {
    const {input, spaces, omit} = this.state;
    const output = transformCss(input, {
      spaces,
      omitBracketsAndSemicolons: omit
    });

    return (
      <Fragment>
        <Container>
          <AppBar position="static" elevation={0}>
            <Toolbar>
              <Heading>🐠 transform-css</Heading>
              <MenuItem href="https://twitter.com/trevorblades">
                <TwitterLogo />
              </MenuItem>
              <Tooltip title="View on GitHub">
                <MenuItem href="https://github.com/trevorblades/transform-css">
                  <GitHubLogo />
                </MenuItem>
              </Tooltip>
            </Toolbar>
          </AppBar>
          <Content>
            <Input
              spellCheck={false}
              value={input}
              onChange={this.onInputChange}
              onKeyDown={this.onInputKeyDown}
            />
            <Output>
              <StyledSyntaxHighlighter
                language={this.state.omit ? 'stylus' : 'less'}
                style={atomOneDark}
                customStyle={{
                  padding,
                  backgroundColor: theme.palette.grey[900]
                }}
                onClick={this.onOutputClick}
              >
                {output}
              </StyledSyntaxHighlighter>
              <Options>
                <FormControlLabel
                  control={
                    <Switch
                      checked={omit}
                      name="omit"
                      onChange={this.onSwitchChange}
                    />
                  }
                  label="SASS/Stylus syntax"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={spaces}
                      name="spaces"
                      onChange={this.onSwitchChange}
                    />
                  }
                  label="Indent using spaces"
                />
              </Options>
            </Output>
          </Content>
        </Container>
      </Fragment>
    );
  }
}

export default hot(module)(App);
