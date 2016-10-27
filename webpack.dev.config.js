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
  entry: [
    'webpack-dev-server/client?http://localhost:5001',
    'webpack/hot/only-dev-server',
    PATHS.entry
  ],

  output: {
    path: PATHS.dist,
    filename: 'bundle.js'
  },

  devServer: {
    contentBase: PATHS.base,
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
    host: '0.0.0.0',
    port: 5001
  },

  devtool: '#eval-source-map',

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
        loader: ['babel-loader'],
        exclude: [nodeModulesDir],
        query: {
          presets: ['es2015']
        }
      },
      // { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
      // inline base64 URLs for <=8k images, direct URLs for the rest
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' }
    ]
  },
  resolve: {
    root: path.resolve(__dirname),
    extensions: ['', '.js', '.jsx', '.css']
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      },
      sourceMap: false
    }),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin('./assets/stylesheets/layout-[hash].css', {
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      template: './index.tpl.html',
      inject: 'body',
      filename: 'index.html'
    })
  ]
};
