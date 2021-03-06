const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

/* Settings for webpack-dev-server */
exports.devServer = function(options) {
    return {
        devServer: {
            // Enable HTML5 history api based routing
            historyApiFallback: true,

            // Enable hot reloading
            hot: true,
            inline: true,

            // Reduce output by only displaying errors
            stats: 'errors-only',

            // Read host and port from env.
            host: options.host, // Default 'localhost'
            port: options.port // Default 8080
        },

        plugins: [
            new webpack.HotModuleReplacementPlugin({
                // Enable multi-pass compilation.
                // Good for performance in large projects
                multiStep: true
            })
        ],
    }
}

/* CSS loading for both prod and dev */
exports.setupCSS = function(paths) {
    return {
        module: {
            loaders: [
                {
                    test: /\.css$/,
                    loaders: ['style', 'css'],
                    include: paths
                }
            ]
        }
    };
}


/* Minification for production */
exports.minify = function() {
    return {
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ]
    };
}

/* set variables for build */
exports.setFreeVariable = function(key, value) {
    const env = {};
    env[key] = JSON.stringify(value);

    return {
        plugins: [
            new webpack.DefinePlugin(env)
        ]
    };
}

/* commons chunk plugin */
exports.extractBundle = function(options) {
    const entry = {};
    entry[options.name] = options.entries;

    return {
        // Define an entry point needed for splitting.
        entry: entry,
        plugins: [
            // Extract bundle and manifest files. Manifest is
            // needed for reliable caching.
            new webpack.optimize.CommonsChunkPlugin({
                names: [options.name, 'manifest'],

                // options.name modules only
                minChunks: Infinity
            })
        ]
    };
}

/* CSS is inlined with the JS in the bundle
 * This plugin pullsthe css into it's own */
exports.extractCSS = function(paths) {
    return {
        module: {
            loaders: [
                // Extract CSS during build
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract('style', 'css'),
                    include: paths
                }
            ]
        },
        plugins: [
            // Output extracted CSS to a file
            new ExtractTextPlugin('[name].[chunkhash].css')
        ]
    };
}

