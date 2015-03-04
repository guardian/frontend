define([
    'lodash/objects/keys',
    'common/views/svgs'
], function (
    keys,
    svgs
) {
    var svgRegEx = /({{inlineSvg\()([^)]*)(\)}})/g, // e.g. {{inlineSvg('marque36icon')}}
        svgParamCleanerRegEx = /["'\s]/g;

    return function (template, params) {
        var keyRegEx = new RegExp('({{)(' + keys(params).join('|') + ')(}})', 'g');
        return template
            .replace(svgRegEx, function (match, openingDelimiter, svg) {
                return svgs.apply(this, svg.replace(svgParamCleanerRegEx, '').split(','));
            })
            .replace(keyRegEx, function (match, openingDelimiter, key) {
                return params[key];
            });
    };
});
