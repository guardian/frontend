const path = require('path');
const execa = require('execa');
const { target } = require('../../config').paths;

const atomCssPrefix = 'atom';

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
                        const dirName = dir.split('/')[
                            dir.split('/').length - 1
                        ];

                        return execa('cp', [
                            `${dir}/article/index.css`,
                            path.join(
                                target,
                                'stylesheets',
                                `${atomCssPrefix}-${dirName}-article-index.css`
                            ),
                        ]);
                    })
                );
            }),
};
