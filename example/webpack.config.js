const EmojiFaviconPlugin = require('emoji-favicon-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const favicon = '🐠';
const title = 'Transform CSS';
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
    new EmojiFaviconPlugin(favicon),
    new HtmlPlugin({
      title,
      template: 'src/index.html'
    }),
    new webpack.DefinePlugin({
      FAVICON: JSON.stringify(favicon),
      TITLE: JSON.stringify(title)
    })
  ]
};
