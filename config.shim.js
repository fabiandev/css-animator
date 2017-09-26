var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: path.join(__dirname, './dist/shim.js'),
  output: {
    path: path.join(__dirname, './dist/bundles'),
    filename: 'shim.js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      }
    ]
  }
}
