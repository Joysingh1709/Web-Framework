const path = require('path');
const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
    mode: "development",
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new CleanWebpackPlugin,
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: './index.html'
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        publicPath: '/'
    }
});