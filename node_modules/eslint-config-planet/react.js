var base = require('./config/base.json');
var merge = require('./lib/util').merge;
var react = require('./config/react.json');

module.exports = merge({}, base, react);
