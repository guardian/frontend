// jshint evil:true
// jshint unused:false

define([
    'common/views/svgs'
], function (
    inlineSvg
) {
    var svgRegEx = /{{(inlineSvg.*)?}}/g,
        keyRegEx = /{{(.*?)}}/g;

    // see docs/inline-svgs.md for info on how to insert an inline SVG in template
    function svgReplacer(match, inlineSvgCall) {
        return eval(inlineSvgCall);
    }

    return function (template, params) {
        return template
            .replace(svgRegEx, svgReplacer)
            .replace(keyRegEx, function (match, key) {
                return params[key];
            });
    };
});
