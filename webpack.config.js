const webpack = require('webpack');
const path = require('path');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');

const PATHS = {
  entry: path.join(__dirname, 'src'),
  app: path.join(__dirname, 'app'),
  dist: path.join(__dirname, 'dist'),
  assets: path.join(__dirname, 'assets'),
  base: path.join(__dirname)
};

console.log('PATHS.entry ', PATHS.entry);
module.exports = {
  entry: './src/index.js',

  output: {
    path: PATHS.dist,
    publicPath: PATHS.assets,
    filename: 'bundle.js'
  },

  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: [nodeModulesDir]
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        cacheDirectory: true,
        loader: 'babel-loader',
        exclude: [nodeModulesDir],
        query: {
          presets: ['es2015']
        }
      },
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }, // use ! to chain loaders
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      // { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' } // inline base64 URLs for <=8k images, direct URLs for the rest
      { test: /\.(png|jpg)$/, loader: 'file-loader?name=./assets/images/img-[hash:6].[ext]' }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
};
