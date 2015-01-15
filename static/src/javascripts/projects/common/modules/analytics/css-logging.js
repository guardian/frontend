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
    function getStylesheets() {
        return _.chain(document.styleSheets)
            .filter(function (sheet) {
                return sheet &&
                    _.values(sheet.rules || sheet.cssRules).length > 0 &&
                    (!sheet.ownerNode || sheet.ownerNode.className !== 'webfont') &&
                    (!sheet.href || sheet.href.match(/\/\/(localhost|assets\.guim\.co\.uk)/));
            })
            .value();
    }

    function randomStylesheet() {
        var stylesheets = getStylesheets(),
            stylesheetLengths = scan(
                stylesheets.map(function (sheet) { return _.values(sheet.rules || sheet.cssRules).length; }),
                function (x, y) { return x + y; },
                0
            ),
            totalRules = stylesheetLengths.pop(),
            randomRule = _.random(0, totalRules);

        return stylesheets[_.reduce(stylesheetLengths, function (acc, len, i) { return randomRule > len ? i : acc; }, 0)];
    }

    function sendReport(stylesheet, allRules) {
        var sampleSize = 50,
            offset,
            rules = _.chain(stylesheet.rules || stylesheet.cssRules)
                .map(function (r) { return r && r.selectorText; })
                .compact()
                .value();

        if (!allRules) {
            offset = _.random(0, Math.max(0, rules.length - sampleSize));
            rules = rules.slice(offset, offset + sampleSize);
        }

        beacon.postJson('/css', JSON.stringify({
            selectors: rules.reduce(function (isUsed, rule) {
                isUsed[rule] = !!document.querySelector(rule);
                return isUsed;
            }, {}),
            contentType: config.page.contentType,
            breakpoint: detect.getBreakpoint(),
            href: stylesheet.href ? url.getPath(stylesheet.href).replace(/stylesheets\/\w+\//, '') : ''
        }), allRules);
    }

    function sendReports(sendAll) {
        _.each(sendAll ? getStylesheets() : [randomStylesheet()], function (stylesheet) {
            sendReport(stylesheet, sendAll);
        });
    }

    return {
        run: sendReports
    };
});
