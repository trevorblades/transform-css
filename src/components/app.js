var React = require('react');

var fishsticss = require('../fishsticss');

var App = React.createClass({

  getInitialState: function() {
    return {
      output: null
    };
  },

  _onInputChange: function() {
    var styles = fishsticss.scrub(this.refs.input.value);
    this.setState({output: fishsticss.print(styles)});
  },

  render: function() {
    return (
      <div className="fs-app">
        <textarea className="fs-input"
            onKeyUp={this._onInputChange}
            ref="input"/>
        <div className="fs-output">{this.state.output}</div>
      </div>
    );
  }
});

module.exports = App;
