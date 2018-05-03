const cpy = require('cpy');
const { target, src } = require('../../config').paths;

module.exports = {
    description: 'Copy fonts',
    task: () =>
        cpy(['**/*', '!*.pdf', '!*.md'], `${target}/fonts`, {
            cwd: `${src}/fonts`,
            parents: true,
            nodir: true,
        }),
};
