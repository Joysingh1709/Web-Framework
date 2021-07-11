const path = require('path');
const common = require("./webpack.common");
const { merge } = require("webpack-merge");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
    output: {
        filename: "[name].[contenthash].js",
        path: path.resolve(__dirname, 'dist')
    },
    optimization: {
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserPlugin(),
            new HtmlWebpackPlugin({
                template: './src/index.html',
                filename: './index.html',
                minify: {
                    removeAttributeQuotes: true,
                    collapseWhitespace: true,
                    removeComments: true
                }
            })
        ]
    },
    // devtool: false,
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        publicPath: '/'
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" }),
        new CleanWebpackPlugin()
    ]
});
