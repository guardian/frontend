define([
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/url',
    'common/utils/scan',
    'common/modules/analytics/beacon'
], function (
    _,
    config,
    detect,
    url,
    scan,
    beacon
) {
    function getReport(returnAll) {
        var maxOut = 50,
            contentType = config.page.contentType,
            breakpoint = detect.getBreakpoint(),

            stylesheets = _.chain(document.styleSheets)
                .filter(function (sheet) {
                    return sheet &&
                        _.values(sheet.rules || sheet.cssRules).length > 0 &&
                        (!sheet.ownerNode || sheet.ownerNode.className !== 'webfont') &&
                        (!sheet.href || sheet.href.match(/\/\/(localhost|assets\.guim\.co\.uk)/));
                })
                .value(),

            stylesheetLengths = scan(
                stylesheets.map(function (sheet) { return _.values(sheet.rules || sheet.cssRules).length; }),
                function (x, y) { return x + y; },
                0
            ),

            totalRules = stylesheetLengths.pop(),

            randomRule = _.random(0, totalRules),

            stylesheet = stylesheets[_.reduce(stylesheetLengths, function (acc, len, i) { return randomRule > len ? i : acc; }, 0)],

            rules = _.chain(stylesheet.rules || stylesheet.cssRules)
                .map(function (r) { return r && r.selectorText; })
                .compact()
                .value(),

            numRules = rules.length,

            offset = _.random(0, Math.max(0, numRules - maxOut)),

            selectors = _.chain(rules.slice(offset, offset + maxOut))
                .reduce(function (out, rule) {
                    out[rule] = !!document.querySelector(rule);
                    return out;
                }, {})
                .value();

        return {
            contentType: contentType,
            breakpoint: breakpoint,
            className: stylesheet.ownerNode && stylesheet.ownerNode.className || '',
            href: stylesheet.href ? url.getPath(stylesheet.href).replace(/stylesheets\/\w+\//, '') : '',
            selectors: selectors
        };
    }

    return {
        run: function () { beacon.postJson('/css', JSON.stringify(getReport())); }
    };
});
