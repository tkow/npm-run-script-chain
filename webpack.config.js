"use strict";
exports.__esModule = true;
var fs = require("fs");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var path = require("path");
var tsconfig_paths_webpack_plugin_1 = require("tsconfig-paths-webpack-plugin");
var ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
var appDirectory = fs.realpathSync(process.cwd());
exports.resolveApp = function (relativePath) { return path.resolve(appDirectory, relativePath); };
exports.plugins = [
    // new BundleAnalyzerPlugin(),
    new tsconfig_paths_webpack_plugin_1.TsconfigPathsPlugin({
        configFile: exports.resolveApp("tsconfig.json")
    }),
    // ts-loader | tslint を別プロセスで動かす
    new ForkTsCheckerWebpackPlugin({
        async: true,
        watch: exports.resolveApp("src"),
        tsconfig: exports.resolveApp("tsconfig.json"),
        tslint: exports.resolveApp("tslint.json")
    }),
    // https://github.com/jantimon/html-webpack-plugin/issues/218
    new HtmlWebpackPlugin({
        chunks: ["index"],
        template: "./src/index.html",
        filename: "index.html"
    }),
];
exports.defaultRules = {
    cacheLoader: {
        loader: "cache-loader"
    },
    sourceMapLoader: {
        test: /\.(js|jsx|mjs)$/,
        loader: "source-map-loader",
        enforce: "pre",
        include: exports.resolveApp("src")
    },
    tsLoader: {
        test: /\.tsx?$/,
        use: [
            {
                loader: "ts-loader",
                options: {
                    transpileOnly: true,
                    experimentalWatchApi: true
                }
            },
        ]
    },
    htmlLoader: {
        test: /\.html$/,
        loader: "html-loader"
    }
};
var module = [
    {
        mode: "development",
        stats: "errors-only",
        entry: {
            index: exports.resolveApp("src/index.tsx")
        },
        devtool: "cheap-module-source-map",
        output: {
            path: exports.resolveApp("lib"),
            chunkFilename: "[name].chunk.js",
            filename: "[name].js"
        },
        module: {
            rules: [exports.defaultRules.cacheLoader, exports.defaultRules.tsLoader, exports.defaultRules.htmlLoader]
        },
        plugins: exports.plugins,
        resolve: {
            extensions: [".mjs", ".web.ts", ".ts", ".web.tsx", ".tsx", ".web.js", ".js", ".json", ".web.jsx", ".jsx"],
            alias: {}
        },
        node: {
            dgram: "empty",
            fs: "empty",
            net: "empty",
            tls: "empty",
            child_process: "empty",
            __dirname: false,
            __filename: false
        },
        devServer: {
            contentBase: exports.resolveApp("lib"),
            port: 3006
        }
    },
];
exports["default"] = module;