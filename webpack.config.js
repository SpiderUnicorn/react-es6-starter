const path = require('path')
const webpack = require('webpack')

/* Split the configuration to extract common behaviour for all
 * configurations and merge it with build / prod config */
const merge = require('webpack-merge')

/* validates webpack config against a schema and reports errors
 * see the module.exports at the bottom of the page */
const validate = require('webpack-validator');

/* Partial configuration to include */
const parts = require('./lib/parts');

/* get config to pull vendor dependencies
 * for splitting the bundle into appropriate
 * chunks */
const package = require('./package.json');

const PATHS = {
    app: path.join(__dirname, 'src'),
    build: path.join(__dirname, 'build')
}

const common = {
    entry: {
        app: PATHS.app,
    },

    output: {
        path: PATHS.build,
        filename: '[name].js',
        publicPath: '/assets/'
    },

    module: {
        preLoaders: [
            {
                test: [/\.jsx?$/, /\.js?$/],
                loader: "eslint",
                include: PATHS.app
            },
        ],

        loaders: [
            {
                test: [/\.jsx?$/, /\.js?$/],
                // cache babel tranpilation for increased performance during development
                loaders: ['react-hot', 'babel?cacheDirectory'],
                include: PATHS.app
            },
        ]
    },

    resolve: {
        extensions: ['', '.js', '.jsx']
    }
}

let config;

/* Branch config based on NPM run command */
switch(process.env.npm_lifecycle_event) {
    case 'build':
        config = merge(
            common,
            {
                devtool: 'source-map'
            },
            parts.setFreeVariable(
                'process.env.NODE_ENV',
                'production'
            ),
            parts.extractBundle({
                name: 'vendor',
                entries: Object.keys(package.dependencies)
            }),
            parts.minify(),
            parts.setupCSS(PATHS.app)
        );
        break;
    default:
        config = merge(
            common,
            {
                devtool: 'eval-source-map'
            },
            parts.setupCSS(PATHS.app),
            parts.devServer({
                // Read host and port from env
                host: process.env.HOST,
                port: process.env.PORT
            })
        );
}

module.exports = validate(config);
