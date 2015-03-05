// jshint evil:true
// jshint unused:false

define([
    'lodash/objects/keys',
    'common/views/svgs'
], function (
    keys,
    inlineSvg
) {
    var svgRegEx = /({{)(inlineSvg\([^)]*\))(}})/g; // e.g. {{inlineSvg('marque36icon')}}

    function svgReplacer(match, openingDelimiter, inlineSvgCall) {
        return eval(inlineSvgCall);
    }

    return function (template, params) {
        var keyRegEx = new RegExp('{{(' + keys(params).join('|') + ')}}', 'g');

        return template
            .replace(svgRegEx, svgReplacer)
            .replace(keyRegEx, function (match, key) {
                return params[key];
            });
    };
});
