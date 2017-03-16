const config = require('./webpack.config.js');

const { bundlePrefix } = config;

config.devtool = 'inline-source-map';
config.output.filename = `${bundlePrefix}[name].js`;
config.output.chunkFilename = `${bundlePrefix}[name].js`;

module.exports = config;
