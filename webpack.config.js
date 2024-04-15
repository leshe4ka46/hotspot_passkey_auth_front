// webpack.config.js
module.exports = {
  entry: './main.*.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/build',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 10000,
      maxSize: 250000,
    },
  },
};