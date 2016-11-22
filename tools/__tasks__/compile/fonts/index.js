const path = require('path');
const fs = require('fs');

const pify = require('pify');
const mkdirp = require('mkdirp');
const postcss = require('postcss');
const perfectionist = require('perfectionist');

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

const {target, src} = require('../../config').paths;
const mimeTypes = {
	woff: 'application/x-font-woff',
	woff2: 'application/x-font-woff',
	ttf: 'font/opentype',
	otf: 'font/opentype',
	eot: 'application/vnd.ms-fontobject'
};

const typeFaces = require('./index.config');

const generateCSS = (fontFamily, font) =>
    readFile(path.resolve(src, 'fonts', `${font.src}`), 'base64')
        .then(data => postcss([perfectionist({format: 'compressed'})]).process(`
                @font-face {
                    font-family: ${fontFamily};
                    src: url(data:${mimeTypes[path.extname(font.src).substr(1)]};base64,${data.toString()});
                    ${[
                        'font-weight',
                        'font-style',
                        'font-stretch',
                        'font-variant',
                        'font-feature-settings',
                        'unicode-range'
                    ].map(prop => {
                        return font[prop] ? `${prop}: ${font[prop]};` : '';
                    }).join('')}
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
               return Promise.all(typeFaces.map(typeFace =>
                   Promise.all(typeFace.fonts.map(generateCSS.bind(null, typeFace['font-family'])))
                       .then(fontsCSS => fontsCSS.join(''))
                       .then(CSS =>
                           writeFile(
                               path.resolve(target, 'fonts', `${typeFace.dest}.json`),
                               `guFont(${JSON.stringify({css: CSS})});\n`)
                       )
               ));
           }
       }
    ]
};
