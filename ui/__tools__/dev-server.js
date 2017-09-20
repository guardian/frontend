// @flow

const express = require('express');
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

    // $FlowFixMe
    const { frontend } = require('../dist/ui.bundle.server'); // eslint-disable-line global-require, import/no-unresolved

    // TODO: pass props from response to UI dev API endpoint
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
    console.log('UI rendering dev server listening on port 3000\n');
});
