import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import React, {Component, Fragment} from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import styled from 'react-emotion';
import theme from '@trevorblades/mui-theme';
import transformCss from '../../lib';
import {hot} from 'react-hot-loader';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
});

const Content = styled.div({
  display: 'flex',
  flexGrow: 1
});

const padding = theme.spacing.unit * 3;
const Input = styled.textarea({
  width: '50%',
  padding,
  border: 'none',
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.fontSize,
  lineHeight: theme.typography.body1.lineHeight,
  outline: 'none'
});

const Output = styled(Typography)({
  flexGrow: 1,
  margin: 0,
  padding,
  backgroundColor: theme.palette.grey[100],
  whiteSpace: 'pre'
});

class App extends Component {
  state = {
    input: '',
    output: ''
  };

  onChange = event => {
    const input = event.target.value;
    this.setState({
      input,
      output: transformCss(input)
    });
  };

  onKeyDown(event) {
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
                transform-css
              </Typography>
            </Toolbar>
          </AppBar>
          <Content>
            <Input
              value={this.state.input}
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
            />
            <Output>{this.state.output}</Output>
          </Content>
        </Container>
      </Fragment>
    );
  }
}

export default hot(module)(App);
