var path = require('path');
var webpack = require('webpack');
const angularExternals = require('webpack-angular-externals');

module.exports = [{
  entry: path.join(__dirname, './dist/index.js'),
  output: {
    library: 'css-animator',
    libraryTarget: 'umd',
    path: path.join(__dirname, './dist/bundles'),
    filename: 'css-animator.js'
  },
  devtool: 'source-map',
  externals: [angularExternals()],
  resolve: {
    alias: {
      'css-animator': '../dist'
    },
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: [path.join(__dirname, 'node_modules', '@angular/compiler')],
        use: ['source-map-loader'],
        enforce: 'pre'
      }
    ]
  }
}, {
  entry: path.join(__dirname, './dist/builder/animation_builder.js'),
  output: {
    library: 'css-animator/builder',
    libraryTarget: 'umd',
    path: path.join(__dirname, './dist/bundles'),
    filename: 'builder.js'
  },
  devtool: 'source-map',
  externals: [angularExternals()],
  resolve: {
    alias: {
      'css-animator': '../dist'
    },
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: [path.join(__dirname, 'node_modules', '@angular/compiler')],
        use: ['source-map-loader'],
        enforce: 'pre'
      }
    ]
  }
}];
