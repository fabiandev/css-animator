var path = require('path');
var webpack = require('webpack');
const angularExternals = require('webpack-angular-externals');

module.exports = [{
  mode: 'production',
  entry: path.join(__dirname, './dist/index.js'),
  output: {
    umdNamedDefine: true,
    library: {
      root: 'css-animator',
      amd: 'css-animator',
      commonjs: 'css-animator'
    },
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
  mode: 'production',
  entry: path.join(__dirname, './dist/builder/animation_builder.js'),
  output: {
    umdNamedDefine: true,
    library: {
      root: 'css-animator/builder',
      amd: 'css-animator/builder',
      commonjs: 'css-animator/builder'
    },
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
