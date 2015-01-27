define([
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/url',
    'common/utils/scan',
    'common/utils/mediator',
    'common/modules/analytics/beacon'
], function (
    _,
    config,
    detect,
    url,
    scan,
    mediator,
    beacon
) {
    var rxPsuedoClass = new RegExp(/:+[^\s\,]+/g),
        rxSeperator = new RegExp(/\s*,\s*/g);

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

    function getRandomStylesheet() {
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
        var sampleSize = 1000,
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
                _.each(rule.replace(rxPsuedoClass, '').split(rxSeperator), function (s) {
                    if (_.isUndefined(isUsed[s])) {
                        isUsed[s] = !!document.querySelector(s);
                    }
                });
                return isUsed;
            }, {}),
            contentType: config.page.contentType,
            breakpoint: detect.getBreakpoint(),
            href: stylesheet.href ? url.getPath(stylesheet.href).replace(/stylesheets\/\w+\//, '') : '',
            className: stylesheet.ownerNode ? stylesheet.ownerNode.className : ''
        }), allRules);
    }

    function makeSender(sendAll) {
        return _.debounce(function (clickSpec) {
            if (!clickSpec || clickSpec.samePage) {
                setTimeout(function () {
                    _.each(sendAll ? getStylesheets() : [getRandomStylesheet()], function (stylesheet) {
                        sendReport(stylesheet, sendAll);
                    });
                }, _.random(0, 3000));
            }
        }, 300);
    }

    return function () {
        var sendAll = window.location.hash === '#csslogging',
            sender;

        if (sendAll || _.random(1, 5000) === 1) {
            sender = makeSender(sendAll);
            sender();
            mediator.on('module:clickstream:interaction', sender);
            mediator.on('module:clickstream:click', sender);
        }
    };
});
