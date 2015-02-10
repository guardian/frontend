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
    var sample = 500,
        rxPsuedoClass = new RegExp(/:+[^\s\,]+/g),
        rxSeparator = new RegExp(/\s*,\s*/g);

    function getRules(all) {
        var rand,
            len,
            rules = _.chain(getStylesheets())
                .map(function (s) { return s.rules || s.cssRules; })
                .compact()
                .map(_.values)
                .flatten()
                .map(function (r) { return r && r.selectorText; })
                .compact()
                .value();

        if (all) {
            return rules;
        } else {
            len = rules.length;
            rand = _.random(0, len);
            return rules.slice(rand, rand + sample).concat(rand + sample < len ? [] : rules.slice(0, (rand + sample) % len));
        }
    }

    function getStylesheets() {
        return _.chain(document.styleSheets)
            .filter(function (sheet) {
                return sheet &&
                    _.values(sheet.rules || sheet.cssRules).length > 0 &&
                    (!sheet.ownerNode || sheet.ownerNode.nodeName !== 'STYLE' || sheet.ownerNode.className.indexOf('js-loggable') > -1) &&
                    (!sheet.href || sheet.href.match(/\/\/(localhost|assets\.guim\.co\.uk)/));
            })
            .value();
    }

    function makeSender(all) {
        return _.debounce(function (clickSpec) {
            if (!clickSpec || clickSpec.samePage) {
                setTimeout(function () {
                    beacon.postJson('/css', JSON.stringify({
                        selectors: getRules(all).reduce(function (isUsed, rule) {
                            _.each(rule.replace(rxPsuedoClass, '').split(rxSeparator), function (r) {
                                if (_.isUndefined(isUsed[r])) {
                                    isUsed[r] = !!document.querySelector(r);
                                }
                            });
                            return isUsed;
                        }, {}),
                        contentType: config.page.contentType || 'unknown',
                        breakpoint: detect.getBreakpoint() || 'unknown'
                    }), all);
                }, all ? 0 : _.random(0, 3000));
            }
        }, 500);
    }

    return function (all) {
        var sender;

        all = all || window.location.hash === '#csslogging';

        if (all || _.random(1, 2500) === 1) {
            sender = makeSender(all);
            sender();
            mediator.on('module:clickstream:interaction', sender);
            mediator.on('module:clickstream:click', sender);
            return true;
        }
    };
});
