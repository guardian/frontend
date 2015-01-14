define([
    'common/utils/_',
    'common/modules/analytics/beacon'
], function (
    _,
    beacon
) {
    function getReport() {
        var stylesheets = _.chain(document.styleSheets)
                .filter(function (sheet) {
                    return sheet &&
                        (!sheet.ownerNode || sheet.ownerNode.className !== 'webfont') &&
                        (!sheet.href || sheet.href.match(/\/\/(localhost|assets\.guim\.co\.uk)/));
                })
                .value(),
            stylesheet = stylesheets[_.random(0, stylesheets.length - 1)],
            rules = _.chain(stylesheet.rules)
                .map(function (r) { return r && r.selectorText; })
                .compact()
                .value(),
            numRules = rules.length,
            maxOut = 50,
            selectors = _.chain(_.range(Math.min(maxOut, numRules)))
                .map(function () {
                    return rules[_.random(0, numRules)];
                })
                .reduce(function (out, rule) {
                    out[rule] = !!document.querySelector(rule);
                    return out;
                }, {})
                .value();

        return {
            href: stylesheet.href,
            className: stylesheet.ownerNode && stylesheet.ownerNode.className,
            selectors: selectors
        };
    }

    return {
        run: function () { beacon.postJson('css', getReport()); }
    }
});
