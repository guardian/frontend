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

const fontDefinitions = require('../__helpers__/fontDefinitions');

app.use(
    webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        noInfo: true,
    })
);

app.use('/assets/fonts', express.static('../static/target/fonts'))

app.use(webpackHotMiddleware(compiler));
app.get('/', (req, res, next) => {
    delete require.cache[require.resolve('../dist/ui.bundle.server')];

    // $FlowFixMe
    const { frontend } = require('../dist/ui.bundle.server'); // eslint-disable-line global-require, import/no-unresolved
    const propsUrl = 'http://localhost:9000/dev/ui/props.json';

    request(propsUrl, (errors, response, body) => {
        if (errors) {
            if (errors.code === 'ECONNREFUSED') {
                const errorMsg = `
                    <h1>
                        Unable to connect to
                        <a href="${propsUrl}">${propsUrl}</a>.
                        Are you running the archive application?
                    </h1>`;

                return res.send(errorMsg);
            }

            return res.send(errors);
        }

        try {
            return res.send(frontend.render(JSON.parse(body)));
        } catch (e) {
            return next(e);
        }
    });
});
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    res.status(500).send(err.stack);
});
app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log('UI rendering dev server listening on port 3000\n');
});
