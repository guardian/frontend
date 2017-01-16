const path = require('path');

module.exports = function (content) {
    this.cacheable && this.cacheable();

    const match = content.match(/<svg([^>]+)+>([\s\S]+)<\/svg>/i);
    const prefix = 'inline-';
    const imageType = path.dirname(this.resourcePath).split('/').pop();
    const fileName = path.basename(this.resourcePath).split('.svg')[0];
    const svg = match ? match[0].replace(/\n/g, ' ').trim() : '';
    const markup = `<span class=\"${prefix}${fileName} ${(imageType !== '' ? prefix + imageType : '')}\">${svg}</span>`;

    this.value = markup;

    return `module.exports = ${JSON.stringify({ markup })}`;
};

module.exports.seperable = true;
