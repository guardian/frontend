const path = require('path');
const execa = require('execa');
const { target } = require('../../config').paths;

const atomCssPrefix = 'atom';

const fontMap = {
    'f-serif-text': '\\"Guardian Text Egyptian Web\\", Georgia, serif',
    'f-serif-headline': '\\"Guardian Egyptian Web\\", Georgia, serif',
    'f-sans-serif-text':
        '\\"Guardian Text Sans Web\\", \\"Helvetica Neue\\", Helvetica, Arial, \\"Lucida Grande\\", sans-serif',
    'f-sans-serif-headline':
        '\\"Guardian Sans Web\\", \\"Helvetica Neue\\", Helvetica, Arial, \\"Lucida Grande\\", sans-serif',
};

module.exports = {
    description: 'Copy atom CSS to target',
    task: () =>
        execa
            .shell(
                `ls -d ${path.join(
                    'node_modules',
                    '@guardian',
                    'atom-renderer',
                    'dist'
                )}/*/`
            )
            .then(dirs => {
                const dirsArray = dirs.stdout
                    .split('\n')
                    .map(dir => dir.replace(/\/$/, ''));

                return Promise.all(
                    dirsArray.map(dir => {
                        const dirName = dir.substr(dir.lastIndexOf('/') + 1);
                        const dest = path.join(
                            target,
                            'stylesheets',
                            `${atomCssPrefix}-${dirName}-article-index.css`
                        );
                        return execa('cp', [
                            `${dir}/article/index.css`,
                            dest,
                        ]).then(() =>
                            Promise.all(
                                Object.entries(
                                    fontMap
                                ).map(([varName, varValue]) =>
                                    execa.shell(
                                        `sed -i '' 's/var(--${varName})/${varValue}/' '${dest}'`
                                    )
                                )
                            )
                        );
                    })
                );
            }),
};
