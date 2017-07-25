// returns pasteup.js a set of sass vars

const path = require('path');
const { ui } = require('../__config__/paths');

require('babel-register')({
    babelrc: false,
    presets: [
        [
            'babel-preset-env',
            {
                modules: 'commonjs',
            },
        ],
        'babel-preset-flow',
    ],
});

// eslint-disable-next-line import/no-dynamic-require
const pasteup = require(path.resolve(ui, 'src', 'pasteup'));

const toSass = (vars, prefix = false) =>
    Object.keys(vars).reduce((sass, key) => {
        const varName = [prefix, key].filter(Boolean).join('-');
        if (typeof vars[key] === 'object') {
            return `${sass} ${toSass(vars[key], varName)}`.trim();
        }
        return `${sass} $${varName}: ${vars[key]};`.trim();
    }, '');

module.exports = toSass(pasteup);
