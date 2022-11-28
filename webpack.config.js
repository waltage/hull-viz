const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const glob = require("glob");

module.exports = {
  resolve: {
    extensions: [".ts", ".js", ".json", ".html", ".css"],
  },
  entry: {
    main: "./index.js",
    typescript: glob.sync("./src/**/*.ts"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/public/index.html",
      filename: "index.html",
    }),
  ],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[name].[contenthash].js",
    clean: true,
  },
  mode: "development",
  target: "web",
  devServer: {
    static: {
      directory: path.join(__dirname, "src/public"),
    },
    compress: true,
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
