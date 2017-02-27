const fs = require('fs');
const path = require('path');

const glob = require('glob');
const gzipSize = require('gzip-size');
const pretty = require('prettysize');
const cssstats = require('cssstats');
const chalk = require('chalk');

const cloudwatch = require('./cloudwatch');

const { target } = require('../__tasks__/config').paths;

const credentials = '/etc/gu/frontend.properties';

const files = [].concat(
    glob.sync(`${target}/javascripts/**/*.js`, {
        ignore: '**/{components,vendor}/**',
        nodir: true,
    }),
    glob.sync(`${target}/stylesheets/**/*`, {
        ignore: '**/*head.identity.css',
        nodir: true,
    })
);

const size = (filePath, fileData) => {
    const unZipped = fs.statSync(filePath).size;
    const zipped = gzipSize.sync(fileData);
    return {
        uncompressed: Number((unZipped / 1024).toFixed(1)),
        uncompressedPretty: pretty(unZipped),
        compressed: Number((zipped / 1024).toFixed(1)),
        compressedPretty: pretty(zipped),
    };
};

const css = (filePath, fileData) => {
    if (!filePath.match(/.css$/)) return {};
    const {
        rules: { total: rules },
        selectors: { total: totalSelectors },
    } = cssstats(fileData, { mediaQueries: false });

    return {
        rules,
        totalSelectors,
        averageSelectors: +(totalSelectors / rules).toFixed(1),
    };
};

const analyse = filePath => {
    console.log(`Analysing ${filePath}`);
    try {
        const fileData = fs.readFileSync(filePath, 'utf8');

        const gzipData = size(filePath, fileData);
        const cssData = css(filePath, fileData);
        const data = Object.assign(gzipData, cssData);

        console.log(`Uncompressed: ${chalk.cyan(data.uncompressedPretty)}`);
        console.log(`Compressed: ${chalk.cyan(data.compressedPretty)}`);

        return cloudwatch
            .configure(credentials)
            .then(() => cloudwatch.log(path.basename(filePath), data))
            .then(msg => {
                console.log(
                    chalk.green(
                        `Successfully logged file data to CloudWatch ${msg.id}`
                    )
                );
                return true;
            })
            .catch(console.log);
    } catch (e) {
        console.log(e);
        return null;
    }
};

files.forEach(analyse);
