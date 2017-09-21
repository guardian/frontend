// This loader breaks the webpack rule of 'do one thing' because we use it internally
// and it makes life easier than passing loads of stuff about, reparsing it per transform etc

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
            },
        ],
        'babel-preset-flow',
    ],
});

const { parseCSS: emotionParser } = require('babel-plugin-emotion/lib/parser');
const pasteup = require('../src/pasteup');

// convert pasteup exports to css vars
// e.g. a.b.c => --a-b-c
const toVars = (vars, prefix = false) =>
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

// turn class selectors into reasonable keys
// {'.header': 'blah} => {'header': 'blah}
const normaliseKeys = styles =>
    Object.keys(styles).reduce(
        (normalised, key) =>
            Object.assign({}, normalised, {
                [key.replace(/^\./, '')]: styles[key],
            }),
        {}
    );

// bloomin heck - replace 'float's that have been converted by postcss-js
// to 'cssFloat' back to 'float'
// https://github.com/rtsao/styletron/pull/54
const reFloat = rules =>
    Object.keys(rules).reduce((refloated, key) => {
        if (key === 'cssFloat') {
            return Object.assign({}, refloated, { float: rules[key] });
        }
        if (typeof rules[key] === 'object') {
            return Object.assign({}, refloated, {
                [key]: reFloat(rules[key]),
            });
        }
        return Object.assign({}, refloated, { [key]: rules[key] });
    }, {});

// splits rules into cheap/expensive clusters where possible which
// can then be handled appropriately
const categoriseStyles = styles =>
    Object.keys(styles).reduce((categorisedStyles, key) => {
        const rule = styles[key];

        const categorisedStyle = Object.keys(
            rule
        ).reduce(({ cheapCSS = {}, expensiveCSS = {} }, decl) => {
            if (
                typeof rule[decl] !== 'object' ||
                (decl.startsWith('@media') &&
                    Object.values(rule[decl]).every(
                        mediaDeclValue => typeof mediaDeclValue !== 'object'
                    ))
            ) {
                return {
                    expensiveCSS,
                    cheapCSS: Object.assign({}, cheapCSS, {
                        [decl]: rule[decl],
                    }),
                };
            }
            return {
                cheapCSS,
                expensiveCSS: Object.assign({}, expensiveCSS, {
                    [decl]: rule[decl],
                }),
            };
        }, {});

        return Object.assign(categorisedStyles, {
            [key]: categorisedStyle,
        });
    }, {});

module.exports = function uiCSS(source) {
    const normalisedSource = normaliseCSS(source);

    const { styles } = reFloat(
        emotionParser(normalisedSource, false, this.resourcePath)
    );

    const normalisedStyles = normaliseKeys(styles);
    const categorisedStyles = categoriseStyles(normalisedStyles);

    return `module.exports = ${JSON.stringify(categorisedStyles)};`;
};
