const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const ReplaceInFileWebpackPlugin = require("replace-in-file-webpack-plugin");
const srcDir = "../src/";

module.exports = {
  entry: {
    popup: path.join(__dirname, srcDir + "popup.js"),
    options: path.join(__dirname, srcDir + "options.js"),
    background: path.join(__dirname, srcDir + "background.js"),
    edropper2: path.join(__dirname, srcDir + "edropper2.ts")
  },
  output: {
    path: path.join(__dirname, "../dist/js"),
    filename: "[name].js"
  },
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks: "initial"
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  plugins: [
    // exclude locale files in moment
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new CopyPlugin([{ from: ".", to: "../" }], { context: "public" }),
    new ReplaceInFileWebpackPlugin([
      {
        dir: "dist",
        files: ["manifest.json", "button-about.html"],
        rules: [
          {
            search: "@version",
            replace: process.env.npm_package_version
          }
        ]
      }
    ])
  ]
};
