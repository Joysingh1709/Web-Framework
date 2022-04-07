const path = require('path');
const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

console.log("webpack.dev.js");

module.exports = merge(common, {
    mode: "development",
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: './index.html'
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        publicPath: '/',
        watchContentBase: true,
        historyApiFallback: true,
        port: 3000,
        open: true,
        hot: true,
        inline: true,
        overlay: true,
        before: function (app, server) {
            app.get('/api/user', function (req, res) {
                res.json({
                    name: 'John Doe',
                    age: 30
                });
            });
        },
        after: function (app, server) {
            app.get('/api/user', function (req, res) {
                res.json({
                    name: 'John Doe after',
                    age: 30
                });
            });
        }
    }
});