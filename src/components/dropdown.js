var React = require('react');
var classNames = require('classnames');

var Dropdown = React.createClass({

  propTypes: {
    items: React.PropTypes.array.isRequired,
    onItemClick: React.PropTypes.func.isRequired,
    selectedIndex: React.PropTypes.number
  },

  getInitialState: function() {
    return {
      isOpen: false
    };
  },

  _onDummyClick: function() {
    this.setState({isOpen: !this.state.isOpen});
  },

  _onItemClick: function(index) {
    this.props.onItemClick(index);
    this.setState({isOpen: false});
  },

  render: function() {
    var dropdownClassName = classNames('fs-dropdown', {
      'fs-open': this.state.isOpen
    });
    return (
      <div className={dropdownClassName}>
        <div className="fs-dropdown-dummy" onClick={this._onDummyClick}>
          {this.props.items[this.props.selectedIndex]}
        </div>
        <div className="fs-dropdown-items">
          {this.props.items.map(function(item, index) {
            return (
              <div className="fs-dropdown-item"
                  key={index}
                  onClick={this._onItemClick.bind(null, index)}>
                {item}
              </div>
            );
          }, this)}
        </div>
      </div>
    )
  }
});

module.exports = Dropdown;
