var path = require('path');

module.exports = {
  entry: './docs/index.ts',
  output: {
    filename: 'example.js'
  },
  resolve: {
    alias: {
      'css-animator': '../src/css-animator'
    },
    extensions: [
      '',
      '.webpack.js',
      '.web.js',
      '.ts',
      '.tsx',
      '.js'
    ]
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  }
}
