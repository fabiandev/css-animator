var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: path.join(__dirname, './docs/index.ts'),
  output: {
    path: path.join(__dirname, './docs/assets'),
    filename: 'app.js'
  },
  devtool: 'source-map',
  resolve: {
    alias: {
      'css-animator': '../src/css-animator'
    },
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: [path.join(__dirname, 'node_modules', '@angular/compiler')],
        use: ['source-map-loader'],
        enforce: "pre"
      }, {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)@angular/,
      path.resolve(__dirname, '../src')
    )
  ]
}
