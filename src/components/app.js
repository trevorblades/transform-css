var React = require('react');

var Dropdown = require('./dropdown');
var Toggle = require('./toggle');
var fishsticss = require('../fishsticss');

var LANGUAGES = ['less', 'sass', 'scss'];
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

  _output: fishsticss.parse(DEFAULT_INPUT),

  getInitialState: function() {
    return {
      createVariables: true,
      format: 'less',
      includeComments: true,
      input: DEFAULT_INPUT,
      languageIndex: 0,
      useTabs: false
    };
  },

  componentWillUpdate: function(nextProps, nextState) {
    this._output = fishsticss.parse(nextState.input, {
      language: LANGUAGES[nextState.languageIndex],
      createVariables: nextState.createVariables,
      includeComments: nextState.includeComments,
      useTabs: nextState.useTabs
    });
  },

  _onLanguageClick: function(nextIndex) {
    this.setState({languageIndex: nextIndex});
  },

  _onCommentsToggle: function() {
    this.setState({includeComments: !this.state.includeComments});
  },

  _onVariablesToggle: function() {
    this.setState({createVariables: !this.state.createVariables});
  },

  _onTabsToggle: function() {
    this.setState({useTabs: !this.state.useTabs});
  },

  _onInputChange: function() {
    this.setState({input: this.refs.input.value});
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
                value={this._output}/>
          </div>
        </div>
        <div className="fs-subheader">
          <Dropdown items={LANGUAGES}
              onItemClick={this._onLanguageClick}
              selectedIndex={this.state.languageIndex}/>
          <Toggle isToggled={this.state.includeComments}
              label="Comments"
              onToggle={this._onCommentsToggle}/>
          <Toggle isToggled={this.state.createVariables}
              label="Color variables"
              onToggle={this._onVariablesToggle}/>
          <Toggle isToggled={!this.state.useTabs}
              label={['Tabs', 'Spaces']}
              onToggle={this._onTabsToggle}/>
        </div>
      </div>
    );
  }
});

module.exports = App;
