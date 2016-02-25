var React = require('react');

var fishsticss = require('../fishsticss');

var DEFAULT_INPUT = '/* Comments ain\'t no thang! */\n' +
    '#id {\n' +
    '\twidth: 100%;\n' +
    '}\n' +
    '#id {\n' +
    '\theight: 100%;\n' +
    '}\n' +
    '#id .class {\n' +
    '\theight: 100%;\n' +
    '}\n' +
    '#id .class .child-class {\n' +
    '\theight: 100%;\n' +
    '}\n' +
    '#id .class.sub-class {\n' +
    '\theight: 100%;\n' +
    '}';

var App = React.createClass({

  getInitialState: function() {
    return {
      output: fishsticss.parse(DEFAULT_INPUT)
    };
  },

  _onInputChange: function() {
    this.setState({output: fishsticss.parse(this.refs.input.value)});
  },

  _onOutputClick: function() {
    this.refs.output.select();
  },

  render: function() {
    return (
      <div className="fs-app">
        <div className="fs-header">
          <h1>Fishsticss</h1>
        </div>
        <div className="fs-row">
          <div className="fs-col">
            <textarea className="fs-input"
                defaultValue={DEFAULT_INPUT}
                onKeyUp={this._onInputChange}
                ref="input"/>
          </div>
          <div className="fs-col">
            <textarea className="fs-output"
                onClick={this._onOutputClick}
                readOnly
                ref="output"
                value={this.state.output}/>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = App;
