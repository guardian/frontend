import path from 'node:path';
import fs from 'node:fs';

import mkdirp from 'mkdirp';
import pify from 'pify';
import uglify from 'uglify-js';
import request from 'request';

const readFileP = pify(fs.readFile);
const writeFileP = pify(fs.writeFile);
const requestP = pify(request, { multiArgs: true });

import { paths } from '../../config.mjs';
const { src, target, vendor } = paths;

const dest = path.resolve(target, 'javascripts', 'vendor');
const polyfillURL = fs
    .readFileSync(path.resolve(src, 'javascripts', 'polyfill.io'), 'utf8')
    .trim();

export default {
    description: 'Bundle polyfill.io fallback',
    task: () => {
        mkdirp.sync(dest);
        // try and get the lastest result from polyfill.io
        // gobbledegook UA means it will return *all* polyfills, so this
        // strictly a worst-case fallback
        return (
            requestP(`${polyfillURL}&ua=qwerty&unknown=polyfill`)
                .then(result => {
                    const [, body] = result;
                    // make sure the response looks about right
                    if (body.endsWith('guardianPolyfilled();')) {
                        return body;
                    }
                    return Promise.reject();
                })
                // if that fails, just use our checked in version.
                // it's probably the same, but this should mean our fallback is
                // always as up to date as possible...
                .catch(() =>
                    readFileP(
                        path.resolve(
                            vendor,
                            'javascripts',
                            'polyfillio.fallback.js'
                        ),
                        'utf8'
                    ).then(
                        polyfills =>
                            uglify.minify(polyfills, { fromString: true }).code
                    )
                )
                .then(polyfills =>
                    writeFileP(
                        path.resolve(dest, 'polyfillio.fallback.js'),
                        polyfills
                    )
                )
        );
    },
};
