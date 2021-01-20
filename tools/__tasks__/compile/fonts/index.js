const path = require('path');
const fs = require('fs');

const pify = require('pify');
const mkdirp = require('mkdirp');
const postcss = require('postcss');
const perfectionist = require('perfectionist');

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

const { target, src } = require('../../config').paths;

const mimeTypes = {
    woff: 'application/x-font-woff',
    woff2: 'application/x-font-woff',
    ttf: 'font/opentype',
};

const typeFaces = require('./index.config');

const toDataURI = (srcPath, data) =>
    `url(data:${
        mimeTypes[path.extname(srcPath).substr(1)]
    };base64,${data.toString()})`;

const generateCSS = (fontFamily, font) =>
    readFile(path.resolve(src, 'fonts', `${font.src}`), 'base64')
        .then(data =>
            postcss([perfectionist({ format: 'compressed' })]).process(`
                @font-face {
                    font-family: ${fontFamily};
                    src: ${toDataURI(font.src, data)};
                    ${[
                        'font-weight',
                        'font-style',
                        'font-stretch',
                        'font-variant',
                        'font-feature-settings',
                        'unicode-range',
                    ]
                        .map(prop =>
                            font[prop] ? `${prop}: ${font[prop]};` : ''
                        )
                        .join('')}
                }
            `)
        )
        .then(result => result.css);

module.exports = {
    description: 'Compile fonts',
    task: [
        require('./clean'),
        {
            description: 'Create webfont JSON',
            task: () => {
                mkdirp.sync(`${target}/fonts`);

                return Promise.all(
                    typeFaces.map(typeFace => {
                        const generateCSSwithFontFamily = generateCSS.bind(
                            null,
                            typeFace['font-family']
                        );
                        const dest = path.resolve(
                            target,
                            'fonts',
                            `${typeFace.dest}`
                        );

                        return Promise.all(
                            typeFace.fonts.map(generateCSSwithFontFamily)
                        )
                            .then(fontsCSS => fontsCSS.join(''))
                            .then(CSS =>
                                writeFile(
                                    dest,
                                    `${JSON.stringify({ css: CSS })}`
                                )
                            );
                    })
                );
            },
        },
    ],
};
