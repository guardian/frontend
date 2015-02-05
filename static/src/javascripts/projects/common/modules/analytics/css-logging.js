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

    function getSelectors(all) {
        var rand,
            len,
            rules = _.chain(getStylesheets())
            .pluck('rules' || 'cssRules')
            .map(_.values)
            .flatten()
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
                    (!sheet.ownerNode || sheet.ownerNode.className !== 'webfont') &&
                    (!sheet.href || sheet.href.match(/\/\/(localhost|assets\.guim\.co\.uk)/));
            })
            .value();
    }

    function sendReport(rules, forceAjax) {
        beacon.postJson('/css', JSON.stringify({
            selectors: _.chain(rules)
                .map(function (r) { return r && r.selectorText; })
                .compact()
                .reduce(function (isUsed, rule) {
                    _.each(rule.replace(rxPsuedoClass, '').split(rxSeparator), function (s) {
                        if (_.isUndefined(isUsed[s])) {
                            isUsed[s] = !!document.querySelector(s);
                        }
                    });
                    return isUsed;
                }, {})
                .value(),
            contentType: config.page.contentType,
            breakpoint: detect.getBreakpoint()
        }), forceAjax);
    }

    function makeSender(sendAll) {
        return _.debounce(function (clickSpec) {
            if (!clickSpec || clickSpec.samePage) {
                setTimeout(function () {
                    sendReport(getSelectors(sendAll), sendAll);
                }, sendAll ? 0 : _.random(0, 3000));
            }
        }, 300);
    }

    return function (sendAll) {
        var sender;

        sendAll = sendAll || window.location.hash === '#csslogging';

        if (sendAll || _.random(1, 2500) === 1) {
            sender = makeSender(sendAll);
            sender();
            mediator.on('module:clickstream:interaction', sender);
            mediator.on('module:clickstream:click', sender);
            return true;
        }
    };
});
