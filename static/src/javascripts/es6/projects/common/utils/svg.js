import _ from 'lodash';

export function translate(load) {
    const prefix = 'inline-',
          data = _.rest(load.metadata.loaderArgument.split('/')),
          fileName = data.pop(),
          typesClasses = _.map(data, function (imageType) {
              return prefix + imageType;
          }).join(' ');

    let svg = '<span class="' + prefix + fileName + ' ' + typesClasses + '">' + load.source + '</span>';

    svg = svg.replace(/(["\\])/g, '\\$1')
        .replace(/[\f]/g, '\\f')
        .replace(/[\b]/g, '\\b')
        .replace(/[\n]/g, '\\n')
        .replace(/[\t]/g, '\\t')
        .replace(/[\r]/g, '\\r')
        .replace(/[\u2028]/g, '\\u2028')
        .replace(/[\u2029]/g, '\\u2029');

    return 'module.exports = "' + svg + '";';
}
