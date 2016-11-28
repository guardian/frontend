const fs = require('fs');
const pify = require('pify');

const renameP = pify(fs.rename);
const readFileP = pify(fs.readFile);
const writeFileP = pify(fs.writeFile);

const {target} = require('../../config').paths;

function replaceCommentInAppJs() {
    const filePath = `${target}/javascripts/app.js`;

    return readFileP(filePath, 'utf8')
            .then(src => src.replace('//# sourceMappingURL=boot.js.map', '//# sourceMappingURL=app.js.map'))
            .then(src => writeFileP(filePath, src));
}

module.exports = {
    description: 'Rename the boot.map.js to app.map.js so that we hash it into the right folder',
    task: () => Promise.all([
        renameP(`${target}/javascripts/boot.js.map`, `${target}/javascripts/app.js.map`),
        replaceCommentInAppJs()
    ])
};
