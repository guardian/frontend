const fs = require('fs');

const sass = require('node-sass');
const glob = require("glob");

const pify = require('pify'); // promisifies functions with callbacks
const pGlob = pify(glob);
const pFs = pify(fs);
const pSass = pify(sass);

const postcss = require('postcss');
const atomised = require('postcss-atomised');
const reporter = require('postcss-reporter');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
const perfectionist = require('perfectionist');

const static = `${__dirname}/../../static`;
const stylesheets = `${static}/src/stylesheets`;
const src = `${stylesheets}/atomised`;
const target = `common/conf/assets`;

pGlob(`${src}/**/*.scss`)
    .then(paths => Promise.all([
        `${stylesheets}/_vars.scss`,
        `${stylesheets}/_mixins.scss`
    ].concat(paths).map(path => pFs.readFile(path, 'utf8'))))
    .then(fileData => fileData.join(''))
    .then(scss => pSass.render({
        data: scss,
        includePaths: [stylesheets]
    }))
    .then(result => result.css.toString())

    // clean + normalise the CSS
    .then(css => postcss([
        autoprefixer({ add: false, browsers: [] }),
        pxtorem({
            replace: true,
            root_value: 16,
            unit_precision: 5,
            prop_white_list: []
        }),
        cssnano({
            core: false,
            discardComments: false,
            discardDuplicates: false,
            mergeLonghand: false,
            mergeRules: false,
            zindex: false
        })
    ]).process(css))

    // atomise it
    .then(cleaned => postcss([
        atomised({
            json: `${target}/atomic-class-map.json`
        }),
        reporter()
    ]).process(cleaned))

    // prep it for inlining
    .then(atomised => postcss([
        autoprefixer(),
        perfectionist({format: 'compact'})
    ]).process(atomised))
    .then(atomisedCSS => pFs.writeFile(`${target}/inline-stylesheets/atomic.css`, atomisedCSS.css, 'utf8'))
    .catch(e => console.log(e))
