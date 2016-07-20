/* global __dirname */

const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'app/main.js'),
    output: {
        path: 'static/target/deploys-radiator',
        filename: 'main.js'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
    }
};
