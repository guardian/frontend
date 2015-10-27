define([
    'common/utils/_'
], function(
    _
) {
    function translate(load) {
        var moduleId = load.name.split('!')[0];
        var relativeModuleId = moduleId.match(new RegExp('^' + System.baseURL + '(.*).svg$'))[1];
        var prefix = 'inline-',
            data = _.rest(relativeModuleId.split('/')),
            fileName = data.pop(),
            typesClasses = _.map(data, function(imageType) {
                return prefix + imageType;
            }).join(' ');

        var svg = '<span class="' + prefix + fileName + ' ' + typesClasses + '">' + load.source + '</span>';

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

    return translate;
})
