const { config, bundlePrefix } = require('./webpack.config.common.js');

config.devtool = 'inline-source-map';
config.output.filename = `${bundlePrefix}[name].js`;
config.output.chunkFilename = `${bundlePrefix}[name].js`;

module.exports = config;
