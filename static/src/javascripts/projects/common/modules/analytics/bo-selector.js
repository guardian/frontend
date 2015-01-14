define([
    'common/utils/_',
    'common/modules/analytics/beacon'
], function (
    _,
    beacon
) {
    function getReport() {
        var maxOut = 50,
            stylesheets = _.chain(document.styleSheets)
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
            offset = _.random(0, Math.max(0, numRules - maxOut)),
            selectors = _.chain(rules.slice(offset, maxOut))
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
    };
});
