/* jscs:disable disallowDanglingUnderscores */
define([
    'common/utils/$',
    'fastdom',
    'qwery',
    'bonzo',
    'bean',
    'Promise',
    'common/utils/_',
    'common/utils/config',
    'common/utils/mediator'
], function (
    $,
    fastdom,
    qwery,
    bonzo,
    bean,
    Promise,
    _,
    config,
    mediator
) {
    // find spaces in articles for inserting ads and other inline content
    var bodySelector = '.js-article__body',
        // minAbove and minBelow are measured in px from the top of the paragraph element being tested
        defaultRules = { // these are written for adverts
            minAbove: 250, // minimum from para to top of article
            minBelow: 300, // minimum from (top of) para to bottom of article
            clearContentMeta: 50, // vertical px to clear the content meta element (byline etc) by. 0 to ignore
            selectors: { // custom rules using selectors. format:
                //'.selector': {
                //   minAbove: <min px above para to bottom of els matching selector>,
                //   minBelow: <min px below (top of) para to top of els matching selector> }
                ' > h2': {minAbove: 0, minBelow: 250}, // hug h2s
                ' > *:not(p):not(h2)': {minAbove: 25, minBelow: 250} // require spacing for all other elements
            }
        },
        // test one element vs another for the given rules
        _testElem = function (para, other, rules) {
            var isMinAbove = para.top - other.bottom >= rules.minAbove,
                isMinBelow = other.top - para.top >= rules.minBelow;
            return isMinAbove || isMinBelow;
        },
        // test one element vs an array of other elements for the given rules
        _testElems = function (para, others, rules) {
            return _(others).every(function (other) {
                return _testElem(para, other, rules);
            }).valueOf();
        };

    function _mapElementToDimensions(el) {
        return {
            top: el.offsetTop,
            bottom: el.offsetTop + el.offsetHeight,
            element: el
        };
    }

    function _debugErrPara(p, message) {
        fastdom.write(function () {
            bonzo(p)
                .addClass('spacefinder--error')
                .attr('data-spacefinder-msg', message);
        });
    }

    function _enforceRules(slots, rules, bodyHeight, debug) {

        var filtered = _(slots),
            contentMeta;

        // enforce minAbove and minBelow rules
        filtered = filtered.filter(function (p) {
            var farEnoughFromTopOfBody = p.top >= rules.minAbove,
                farEnoughFromBottomOfBody = p.top + rules.minBelow <= bodyHeight,
                valid = farEnoughFromTopOfBody && farEnoughFromBottomOfBody;

            if (debug && !valid) {
                if (!farEnoughFromTopOfBody) { _debugErrPara(p.element, 'too close to top of body'); }
                if (!farEnoughFromBottomOfBody) { _debugErrPara(p.element, 'too close to bottom of body'); }
            }

            return valid;
        });

        // enforce content meta rule
        if (rules.clearContentMeta) {
            contentMeta = _mapElementToDimensions(qwery('.js-content-meta')[0]);
            filtered = filtered.filter(function (p) {
                var valid = p.top > (contentMeta.bottom + rules.clearContentMeta);
                if (debug && !valid) { _debugErrPara(p.element, 'too close to content meta'); }
                return valid;
            });
        }

        // enforce selector rules
        _(rules.selectors).forOwn(function (params, selector) {
            var relevantElems = _(qwery(bodySelector + selector)).map(_mapElementToDimensions);

            filtered = filtered.filter(function (p) {
                var valid = _testElems(p, relevantElems, params);
                if (debug && !valid) {
                    _debugErrPara(p.element, 'too close to selector (' + selector + ')');
                }
                return valid;
            });
        });
        return filtered.valueOf();
    }

    function onImagesLoaded() {
        var notLoaded = _.filter($('.js-article__body img'), function (img) {
            return !img.complete;
        });

        return Promise.all(_.map(notLoaded, function (img) {
            return new Promise(function (resolve) {
                window.setTimeout(resolve, 5000);
                bean.on(img, 'load', resolve);
            });
        }));
    }

    function onRichLinksUpgraded() {
        return new Promise(function (resolve) {
            window.setTimeout(resolve, 5000);

            (function check() {
                var unloaded = qwery('.js-article__body .element-rich-link--not-upgraded');

                if (!unloaded.length) {
                    return resolve();
                }

                mediator.once('rich-link:loaded', check);
            })();
        });
    }

    function getReady() {
        if (config.switches.viewability) {
            return Promise.all([onImagesLoaded(), onRichLinksUpgraded()]);
        }

        return Promise.resolve();
    }

    // getParaWithSpace returns a paragraph that satisfies the given/default rules:
    function getParaWithSpace(rules, debug) {
        var bodyBottom, paraElems, slots;
        rules = rules || defaultRules;

        // get all immediate children
        return getReady().then(function () {
            return new Promise(function (resolve) {
                if (qwery(bodySelector)[0]) {
                fastdom.read(function () {
                    bodyBottom = qwery(bodySelector)[0].offsetHeight;
                    paraElems = _(qwery(bodySelector + ' > p')).map(_mapElementToDimensions);

                    if (debug) { // reset any previous debug messages
                        fastdom.write(function () {
                            bonzo(paraElems.pluck('element').valueOf())
                                .attr('data-spacefinder-msg', '')
                                .removeClass('spacefinder--valid')
                                .removeClass('spacefinder--error');
                        });
                    }

                    slots = _enforceRules(paraElems, rules, bodyBottom, debug);

                    if (debug) {
                        fastdom.write(function () {
                            bonzo(_.pluck(slots, 'element')).addClass('spacefinder--valid');
                        });
                    }

                    resolve(slots.length ? slots[0].element : undefined);
                });}
            });
        });
    }

    return {
        getParaWithSpace: getParaWithSpace,
        _testElem: _testElem, // exposed for unit testing
        _testElems: _testElems // exposed for unit testing
    };
});
