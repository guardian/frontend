/* eslint-disable import/no-extraneous-dependencies, no-console */

const path = require('path');
const { readFileSync } = require('fs');

const express = require('express');
const webpack = require('webpack');
const createWebpackMiddleware = require('webpack-dev-middleware');
const createWebpackHotMiddleware = require('webpack-hot-middleware');

const root = path.resolve(__dirname, '..');
const webpackConfig = require('../__config__/webpack.config.dev.js').find(
    config => config.entry['bundle.browser']
);

const compiler = webpack(webpackConfig);
const app = express();

const webpackDevMiddleware = createWebpackMiddleware(compiler, {
    quiet: true,
    noInfo: true,
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
    publicPath: '/',
});
app.use(webpackDevMiddleware);
app.use(
    createWebpackHotMiddleware(compiler, {
        log: console.log,
    })
);

const initialState = require('./article.json');

// eslint-disable-next-line no-eval
eval(readFileSync(path.resolve(root, 'dist', 'bundle.server.js'), 'utf8'));

app.get('/', (request, response) => {
    response.send(`<!DOCTYPE html>
        ${this.frontend.render(initialState)}`);
});

app.listen(3000, () => console.log('App listening on http://localhost:3000'));
