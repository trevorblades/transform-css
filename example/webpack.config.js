const EmojiFaviconPlugin = require('emoji-favicon-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new EmojiFaviconPlugin('🐠'),
    new HtmlPlugin({
      title: 'Transform CSS',
      template: 'src/index.html'
    })
  ]
};
