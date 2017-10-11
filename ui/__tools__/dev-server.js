const request = require('request');
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

    request('http://localhost:9000/dev/props', (errors, response, body) => {
        res.send(frontend.render(JSON.parse(body)));
    });
});

app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log('UI rendering dev server listening on port 3000\n');
});
