var React = require('react');

var Dropdown = require('./dropdown');
var Toggle = require('./toggle');
var fishsticss = require('../fishsticss');

var LANGUAGES = ['less', 'sass', 'scss'];
var DEFAULT_INPUT = '/* Comments ain\'t no thang! */ #id { width: 100%; color: rgb(0, 0,15); } #id { height: 100%; } #id .class { height: 100%; border: 1px solid #ff0000; } /* A comment before a child class */ #id .class .child-class { margin-top: 24px; } /* A comment before a sub class */ #id .class.sub-class { color: #ff0000; }';

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
            <label htmlFor="fs-output">
              {LANGUAGES[this.state.languageIndex].toUpperCase() + ' output'}
            </label>
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
        <div className="fs-footer">
          <span>A project by </span>
          <a href="https://twitter.com/trevorblades" target="_blank">Trevor Blades</a>
          <div className="fs-float-right">
            <span>See a bug? Want to contribute? Fishsticss on </span>
            <a href="https://github.com/trevorblades/fishsticss" target="_blank">GitHub</a>
            <span> and </span>
            <a href="https://twitter.com/fishsticss" target="_blank">Twitter</a>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = App;
