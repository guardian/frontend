define([
    'Promise',
    'common/utils/_',
    'common/utils/config',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/url',
    'common/utils/scan',
    'common/utils/mediator',
    'common/modules/analytics/beacon'
], function (
    Promise,
    _,
    config,
    ajax,
    detect,
    url,
    scan,
    mediator,
    beacon
) {
    var sample = 500,
        rxPsuedoClass = new RegExp(/:+[^\s\,]+/g),
        rxSeparator = new RegExp(/\s*,\s*/g),
        classNameLoggable = 'js-loggable',
        classNameInlined = 'js-inlined',
        eventsInitialised = false;

    function getRules(s) {
        var rules = s ? s.cssRules || s.rules : null;
        return rules ? _.values(rules) : s;
    }

    function getSplitSelectors(ruleObj) {
        return ruleObj && ruleObj.selectorText && ruleObj.selectorText.replace(rxPsuedoClass, '').split(rxSeparator);
    }

    function canonicalise(selector) {
        var siblings = selector.match(/\.[^\s\.]+\.[^\s]+/g) || [];

        siblings.forEach(function (s) {
            selector = selector.replace(s, canonicalOrder(s));
        });
        return selector.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
    }

    function canonicalOrder(s) {
        return _.sortBy(s.split('.')).join('.');
    }

    function getAllSelectors(all) {
        var rand,
            len,
            rules = _.chain(getInlineStylesheets())
                .map(getRules)
                .flattenDeep()
                .map(getRules) // 2nd pass for rules nested in media queries
                .flattenDeep()
                .map(getSplitSelectors)
                .flattenDeep()
                .compact()
                .uniq()
                .map(canonicalise)
                .value();

        if (all) {
            return rules;
        } else {
            len = rules.length;
            rand = _.random(0, len);
            return rules.slice(rand, rand + sample).concat(rand + sample < len ? [] : rules.slice(0, (rand + sample) % len));
        }
    }

    function getInlineStylesheets() {
        return _.chain(document.styleSheets)
            .filter(function (sheet) {
                return sheet &&
                    _.values(sheet.rules || sheet.cssRules).length > 0 &&
                    sheet.ownerNode &&
                    sheet.ownerNode.nodeName === 'STYLE' &&
                    sheet.ownerNode.className.indexOf(classNameLoggable) > -1;
            })
            .value();
    }

    function reloadSheetInline(sheet) {
        return ajax({
            url: sheet.href,
            crossOrigin: true
        }).then(function (resp) {
            var el = document.createElement('style');
            el.className = classNameLoggable;
            el.innerHTML = resp;
            document.getElementsByTagName('head')[0].appendChild(el);
        });
    }

    function reloadSheetsInline() {
        return Promise.all(
            _.chain(document.styleSheets)
            .filter(function (sheet) {
                return sheet &&
                    sheet.href &&
                    sheet.href.match(/\/\/(localhost|assets\.guim\.co\.uk)/) &&
                    (!sheet.media || sheet.media.mediaText !== 'print') &&
                    sheet.ownerNode.className.indexOf(classNameInlined) === -1;
            })
            .forEach(function (sheet) {
                sheet.ownerNode.className += ' ' + classNameInlined;
            })
            .map(reloadSheetInline)
            .value()
        );
    }

    function sendReport(all) {
        reloadSheetsInline()
        .then(function () {
            beacon.postJson('/css', JSON.stringify({
                selectors: _.chain(getAllSelectors(all))
                    .reduce(function (isUsed, s) {
                        if (_.isUndefined(isUsed[s])) {
                            isUsed[s] = !!document.querySelector(s);
                        }
                        return isUsed;
                    }, {})
                    .value(),
                contentType: config.page.contentType || 'unknown',
                breakpoint: detect.getBreakpoint() || 'unknown'
            }), all);
        });
    }

    function makeSender(all) {
        return _.debounce(function (clickSpec) {
            if (!clickSpec || clickSpec.samePage) {
                setTimeout(function () {
                    sendReport(all);
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

            if (!eventsInitialised) {
                mediator.on('module:clickstream:interaction', sender);
                mediator.on('module:clickstream:click', sender);
                eventsInitialised = true;
            }
        }
    };
});
