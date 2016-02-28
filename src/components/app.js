var React = require('react');

var Toggle = require('./toggle');
var fishsticss = require('../fishsticss');

var DEFAULT_INPUT = '/* Comments ain\'t no thang! */\n' +
    '#id {\n' +
    '\twidth: 100%;\n' +
    '\tcolor: rgb(0, 0,15);\n' +
    '}\n' +
    '#id {\n' +
    '\theight: 100%;\n' +
    '}\n' +
    '#id .class {\n' +
    '\theight: 100%;\n' +
    '\tbackground-color: #ff0000;\n' +
    '}\n' +
    '/* A comment before a child class */\n' +
    '#id .class .child-class {\n' +
    '\tmargin-top: 24px;\n' +
    '}\n' +
    '/* A comment before a sub class */\n' +
    '#id .class.sub-class {\n' +
    '\tcolor: #ff0000;\n' +
    '}';

var App = React.createClass({

  getInitialState: function() {
    return {
      createVariables: true,
      format: 'less',
      includeComments: true,
      output: fishsticss.parse(DEFAULT_INPUT),
      indentSize: 2,
      useTabs: false
    };
  },

  _onCommentsToggle: function() {
    this.setState({includeComments: !this.state.includeComments});
  },

  _onInputChange: function() {
    this.setState({
      output: fishsticss.parse(this.refs.input.value, {
        createVariables: this.state.createVariables,
        includeComments: this.state.includeComments,
        indentSize: this.state.indentSize,
        useTabs: this.state.useTabs
      })
    });
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
        <div className="fs-subheader">
          <Toggle isToggled={this.state.includeComments}
              label="Comments"
              onToggle={this._onCommentsToggle}/>
        </div>
        <div className="fs-row">
          <div className="fs-col">
            <label htmlFor="fs-input">CSS input</label>
            <textarea defaultValue={DEFAULT_INPUT}
                id="fs-input"
                onKeyUp={this._onInputChange}
                ref="input"/>
          </div>
          <div className="fs-col">
            <label htmlFor="fs-output">{this.state.format.toUpperCase() + ' output'}</label>
            <textarea id="fs-output"
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
