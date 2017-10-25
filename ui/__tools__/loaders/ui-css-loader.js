
const postcss = require('postcss');
const customProperties = require('postcss-custom-properties');
const customMedia = require('postcss-custom-media');
const apply = require('postcss-apply');
const decamelize = require('decamelize');

require('babel-register')({
    babelrc: false,
    presets: [
        [
            'babel-preset-env',
            {
                modules: 'commonjs',
                targets: {
                    node: 'current',
                },
            },
        ],
        'babel-preset-flow',
    ],
});

const pasteup = require('../../src/pasteup');

// convert pasteup exports to css vars
// e.g. a.b.c => --a-b-c
const toVars = (vars, prefix = '') =>
    Object.keys(vars).reduce((cssVars, key) => {
        const varName = [prefix, decamelize(key, '-')]
            .filter(Boolean)
            .join('-');

        if (typeof vars[key] === 'object') {
            return Object.assign({}, cssVars, toVars(vars[key], varName));
        }

        return Object.assign({}, cssVars, {
            [varName]: vars[key],
        });
    }, {});

// our own processing of the CSS source file
const normaliseCSS = source =>
    postcss()
        .use(
            customProperties({
                variables: toVars(pasteup),
            })
        )
        .use(
            customMedia({
                extensions: Object.keys(pasteup.breakpoints).reduce(
                    (breakpoints, breakpoint) =>
                        Object.assign({}, breakpoints, {
                            [`--from-${breakpoint}`]: `(min-width: ${pasteup
                                .breakpoints[breakpoint] / 16}em)`,
                            [`--until-${breakpoint}`]: `(max-width: ${(pasteup
                                    .breakpoints[breakpoint] -
                                1) /
                            16}em)`,
                        }),
                    {}
                ),
            })
        )
        .use(apply())
        .process(source).css;


module.exports = function uiCSS(source) {
    return normaliseCSS(source);
};
