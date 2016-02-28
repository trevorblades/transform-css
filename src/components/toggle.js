var React = require('react');
var classNames = require('classnames');

var Toggle = React.createClass({

  propTypes: {
    isToggled: React.PropTypes.bool,
    label: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.array
    ]),
    onToggle: React.PropTypes.func
  },

  _renderSecondLabel: function() {
    if (Array.isArray(this.props.label) && this.props.label.length > 1) {
      return <div className="fs-toggle-label">{this.props.label[1]}</div>;
    }
  },

  render: function() {
    var toggleClassName = classNames('fs-toggle', {
      'fs-toggled': this.props.isToggled
    });
    return (
      <div className={toggleClassName} onClick={this.props.onToggle}>
        <div className="fs-toggle-label">
          {Array.isArray(this.props.label) ?
              this.props.label[0] : this.props.label}
        </div>
        <div className="fs-toggle-control">
          <div className="fs-toggle-control-handle"/>
        </div>
        {this._renderSecondLabel()}
      </div>
    );
  }
});

module.exports = Toggle;
