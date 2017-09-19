// @flow

const express = require('express');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('../__config__/webpack.config.dev')({
    browser: true,
});

const compiler = webpack(webpackConfig);
const app = express();

app.use(
    webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        noInfo: true,
    })
);
app.use(webpackHotMiddleware(compiler));
app.get('/', (req, res) => {
    delete require.cache[require.resolve('../dist/ui.bundle.server')];

    // eslint-disable-next-line global-require
    const { frontend } = require('../dist/ui.bundle.server');

    res.send(
        frontend.render({
            beaconUrl: '//beacon.gu-web.net',
            bundleUrl: '/assets/javascripts/ui.bundle.browser.js',
            polyfillioUrl:
                'https://assets.guim.co.uk/polyfill.io/v2/polyfill.min.js?rum=0&features=es6,es7,es2017,default-3.6,HTMLPictureElement&flags=gated&callback=guardianPolyfilled',
        })
    );
});

app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log('Dev server listening on port 3000\n');
});
