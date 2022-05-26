const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const SizePlugin = require('size-plugin')

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new SizePlugin({ filename: ".prod.size.json" }),
        new webpack.DefinePlugin({
            DEV_MODE: JSON.stringify(false),
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: true,
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                },
            }),
        ],
    },
})
