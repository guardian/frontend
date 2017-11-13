const fs = require('fs');
const pify = require('pify');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
const cssVars = require('postcss-css-variables');
const atomVars = require('./atomVars');

const writeFileP = pify(fs.writeFile);

const BROWSERS_LIST = [
    'Firefox >= 26',
    'Explorer >= 10',
    'Safari >= 5',
    'Chrome >= 36',

    'iOS >= 5',
    'Android >= 2',
    'BlackBerry >= 6',
    'ExplorerMobile >= 7',

    '> 2% in US',
    '> 2% in AU',
    '> 2% in GB',
];

const REMIFICATIONS = {
    replace: true,
    root_value: 16,
    unit_precision: 5,
    propList: ['*'],
};

module.exports = (
    sources,
    { remify = true, cssvars = false, browsers = BROWSERS_LIST } = {}
) => {
    const postcssPlugins = [autoprefixer({ browsers })];
    if (remify) {
        postcssPlugins.push(pxtorem(REMIFICATIONS));
    }
    if (cssvars) {
        postcssPlugins.push(cssVars({ variables: atomVars.vars }));
    }

    return Promise.all(
        sources.map(({ content, filePath, dest }) =>
            postcss(postcssPlugins)
                .process(content.css.toString(), {
                    from: filePath,
                    to: dest,
                    map: {
                        inline: false,
                        prev: content.map ? content.map.toString() : null,
                    },
                })
                .then(result =>
                    Promise.all([
                        writeFileP(dest, result.css),
                        writeFileP(`${dest}.map`, result.map),
                    ])
                )
        )
    );
};
