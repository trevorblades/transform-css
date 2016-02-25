var React = require('react');

var fishsticss = require('../fishsticss');

var DEFAULT_INPUT = '/* Comments ain\'t no thang! */\n' +
    'body {\n' +
    '\twidth: 0px;\n' +
    '\tcolor: #000;\n' +
    '}\n' +
    'body #div {\n' +
    '\twidth: 100%;\n' +
    '}';

var App = React.createClass({

  getInitialState: function() {
    return {
      output: fishsticss.print(fishsticss.scrub(DEFAULT_INPUT))
    };
  },

  _onInputChange: function() {
    var styles = fishsticss.scrub(this.refs.input.value);
    this.setState({output: fishsticss.print(styles)});
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
                onKeyUp={this._onInputChange}
                ref="input">
              {DEFAULT_INPUT}
            </textarea>
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
