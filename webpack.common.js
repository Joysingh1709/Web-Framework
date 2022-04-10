const path = require('path');
const glob = require('glob')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

var entries = glob.sync('./src/public/**/*.js').reduce((acc, path) => {
    const name = path.split('/').pop().split('.')[0];
    acc[name] = path
    return acc
}, {});

module.exports = {
    entry: {
        main: './src/main.ts',
        ...entries
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ["ts-loader"],
                exclude: [/node_modules/],
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname)
                ]
            },
            {
                test: /\.html$/,
                use: ["html-loader"]
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader, //3. Extract css into files
                    "css-loader", //2. Turns css into commonjs
                    "sass-loader" //1. Turns sass into css
                ]
            },
            {
                test: /\.(svg|png|jpg|gif)$/,
                use: {
                    loader: "file-loader",
                    options: {
                        name: "[name].[hash].[ext]",
                        outputPath: "assets"
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
    // devtool: false,
}
