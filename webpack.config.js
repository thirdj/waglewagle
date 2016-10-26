const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const nodeModulesDir = path.resolve(__dirname, 'node_modules');

const PATHS = {
  entry: path.resolve(__dirname, 'src'),
  app: path.resolve(__dirname, 'app'),
  dist: path.resolve(__dirname, 'dist'),
  assets: path.resolve(__dirname, 'assets'),
  base: path.resolve(__dirname)
};

module.exports = {
  entry: {
    main: [
      './src/index.js',
      './assets/stylesheets/layout.css',
      './assets/images/icon.png'
    ]
  },

  output: {
    path: PATHS.dist,
    filename: './assets/javascripts/bundle-[hash].js'
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
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
      { test: /\.(jpe?g|png|gif|svg)$/i, loader: 'file-loader?name=assets/images/[name].[ext]' }
    ],
    resolve: {
      root: [PATHS.entry],
      extensions: ['', '.js', '.jsx', '.css']
    }
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new ExtractTextPlugin('./assets/stylesheets/layout-[hash].css', {
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ]
};
