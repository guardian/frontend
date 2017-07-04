const path = require('path');

module.exports = function svgLoader(content) {
    const match = content.match(/<svg([^>]+)+>([\s\S]+)<\/svg>/i);
    const prefix = 'inline-';
    const imageType = path.dirname(this.resourcePath).split('/').pop();
    const fileName = path.basename(this.resourcePath, '.svg');
    const svg = match ? match[0].replace(/\n/g, ' ').trim() : '';
    const markup = `<span class="${prefix}${fileName} ${imageType !== ''
        ? prefix + imageType
        : ''}">${svg}</span>`;

    this.value = markup;

    return `module.exports = ${JSON.stringify({ markup })}`;
};
