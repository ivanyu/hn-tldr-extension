const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = (env, argv) => {
    return {
        entry: {
        },
        output: {
            // filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist-firefox')
        },
        devtool: argv.mode === 'production' ? "source-map" : "inline-cheap-source-map",
        optimization: {
            // This ensures each entry point gets its own file
            splitChunks: {
                chunks: 'async'
            },
            minimize: false
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js', to: 'browser-polyfill.js' },
                    { from: 'src/background.js', to: 'background.js' },
                    { from: 'src/content.js', to: 'content.js' },
                    { from: 'src/options.html', to: 'options.html' },
                    { from: 'src/options.js', to: 'options.js' },
                    { from: 'src/options_const.js', to: 'options_const.js' },
                    { from: 'manifest-firefox.json', to: 'manifest.json' },
                    { from: 'icons/*.png', to: '[name][ext]' }
                ]
            })
        ]
    };
};
