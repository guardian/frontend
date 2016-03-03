/* jscs:disable disallowDanglingUnderscores */
define([
    'common/utils/fastdom-promise',
    'qwery',
    'bonzo',
    'bean',
    'Promise',
    'common/utils/config',
    'common/utils/mediator',
    'lodash/collections/filter',
    'lodash/collections/map',
    'lodash/collections/every',
    'lodash/objects/forOwn',
    'lodash/functions/curry'
], function (
    fastdom,
    qwery,
    bonzo,
    bean,
    Promise,
    config,
    mediator,
    filter,
    map,
    every,
    forOwn,
    curry
) {
    // maximum time (in ms) to wait for images to be loaded and rich links
    // to be upgraded
    var LOADING_TIMEOUT = 5000;

    // find spaces in articles for inserting ads and other inline content
    // minAbove and minBelow are measured in px from the top of the paragraph element being tested
    var defaultRules = { // these are written for adverts
        bodySelector: '.js-article__body',
        slotSelector: ' > p',
        absoluteMinAbove: 0, // minimum from slot to top of page
        minAbove: 250, // minimum from para to top of article
        minBelow: 300, // minimum from (top of) para to bottom of article
        clearContentMeta: 50, // vertical px to clear the content meta element (byline etc) by. 0 to ignore
        selectors: { // custom rules using selectors. format:
            //'.selector': {
            //   minAbove: <min px above para to bottom of els matching selector>,
            //   minBelow: <min px below (top of) para to top of els matching selector> }
            ' > h2': {minAbove: 0, minBelow: 250}, // hug h2s
            ' > *:not(p):not(h2)': {minAbove: 25, minBelow: 250} // require spacing for all other elements
        },

        // filter:(slot:Element, index:Integer, slots:Collection<Element>) -> Boolean
        // will run each slot through this fn to check if it must be counted in
        filter: null,

        // startAt:Element
        // will remove slots before this one
        startAt: null,

        // stopAt:Element
        // will remove slots from this one on
        stopAt: null,

        // fromBotton:Boolean
        // will reverse the order of slots (this is useful for lazy loaded content)
        fromBottom: false
    };

    function expire(resolve) {
        window.setTimeout(resolve, LOADING_TIMEOUT);
    }

    function onImagesLoaded(body) {
        var notLoaded = filter(qwery('img', body), function (img) {
            return !img.complete;
        });

        return notLoaded.length === 0 ?
            Promise.resolve(true) :
            new Promise(function (resolve) {
                var loadedCount = 0;
                bean.on(body, 'load', notLoaded, function onImgLoaded() {
                    loadedCount += 1;
                    if (loadedCount === notLoaded.length) {
                        bean.off(body, 'load', onImgLoaded);
                        notLoaded = null;
                        resolve();
                    }
                });
            });
    }

    function onRichLinksUpgraded(body) {
        return qwery('.element-rich-link--not-upgraded', body).length === 0 ?
            Promise.resolve(true) :
            new Promise(function (resolve) {
                mediator.once('rich-link:loaded', resolve);
            });
    }

    // test one element vs another for the given rules
    function _testElem(rules, elem, other) {
        var isMinAbove = elem.top - other.bottom >= rules.minAbove;
        var isMinBelow = other.top - elem.top >= rules.minBelow;

        return isMinAbove || isMinBelow;
    }

    // test one element vs an array of other elements for the given rules
    function _testElems(rules, elem, others) {
        return every(others, curry(_testElem)(rules, elem));
    }

    function _mapElementToDimensions(el) {
        return {
            top: el.offsetTop,
            bottom: el.offsetTop + el.offsetHeight,
            element: el
        };
    }

    function _enforceRules(slots, rules, bodyTop, bodyHeight) {
        var filtered = Promise.resolve(slots);

        // enforce absoluteMinAbove rule
        if (rules.absoluteMinAbove > 0) {
            filtered = filtered.then(filter(slots, function (slot) {
                return bodyTop + slot.top >= rules.absoluteMinAbove;
            }));
        }

        // enforce minAbove and minBelow rules
        filtered = filtered.then(function (slots) {
            return filter(slots, function (slot) {
                var farEnoughFromTopOfBody = slot.top >= rules.minAbove;
                var farEnoughFromBottomOfBody = slot.top + rules.minBelow <= bodyHeight;
                return farEnoughFromTopOfBody && farEnoughFromBottomOfBody;
            });
        });

        // enforce content meta rule
        if (rules.clearContentMeta) {
            filtered = filtered.then(function (slots) {
                return [slots, qwery('.js-content-meta')[0]];
            }).then(function (args) {
                return fastdom.read(function () {
                    return [args[0], _mapElementToDimensions(args[1])];
                });
            }).then(function (args) {
                return filter(args[0], function (slot) {
                    return slot.top > (args[1].bottom + rules.clearContentMeta);
                });
            });
        }

        // enforce selector rules
        if (rules.selectors) {
            forOwn(rules.selectors, function (params, selector) {
                filtered = filtered.then(function (slots) {
                    return [slots, qwery(rules.bodySelector + selector)];
                }).then(function (args) {
                    return fastdom.read(function () {
                        return [args[0], map(args[1], _mapElementToDimensions)];
                    });
                }).then(function (args) {
                    return filter(args[0], function (slot) {
                        return _testElems(params, slot, args[1]);
                    });
                });
            });
        }

        return filtered;
    }

    function getReady(body) {
        if (config.switches.viewability) {
            return Promise.race([
                new Promise(expire),
                Promise.all([onImagesLoaded(body), onRichLinksUpgraded(body)])
            ]);
        }

        return Promise.resolve(true);
    }

    // Rather than calling this directly, use spaceFiller to inject content into the page.
    // SpaceFiller will safely queue up all the various asynchronous DOM actions to avoid any race conditions.
    function findSpace(rules) {
        var body;

        rules = rules || defaultRules;
        body = rules.bodySelector ? document.querySelector(rules.bodySelector) : document;

        return getReady(body)
        .then(getSlots)
        .then(getMeasurements)
        .then(enforceRules)
        .then(filterSlots)
        .then(returnSlots);

        function getSlots() {
            var slots = qwery(rules.bodySelector + rules.slotSelector);
            if (rules.fromBottom) {
                slots.reverse();
            }
            if (rules.startAt) {
                var drop = true;
                slots = filter(slots, function (slot) {
                    if (slot === rules.startAt) {
                        drop = false;
                    }
                    return !drop;
                });
            }
            if (rules.stopAt) {
                var keep = true;
                slots = filter(slots, function (slot) {
                    if (slot === rules.stopAt) {
                        keep = false;
                    }
                    return keep;
                });
            }
            return slots;
        }

        function getMeasurements(slots) {
            return fastdom.read(function () {
                var rect = body.getBoundingClientRect();
                return [
                    rect.top + window.pageYOffset,
                    rect.height,
                    map(slots, _mapElementToDimensions)
                ];
            });
        }

        function enforceRules(data) {
            return _enforceRules(data[2], rules, data[0], data[1]);
        }

        function filterSlots(slots) {
            return rules.filter ?
                filter(slots, rules.filter) :
                slots;
        }

        function returnSlots(slots) {
            if (slots.length) {
                return map(slots, function (slot) { return slot.element; });
            } else {
                throw new Error('There is no space left matching rules ' + JSON.stringify(rules));
            }
        }
    }

    return {
        findSpace: findSpace,
        _testElem: _testElem, // exposed for unit testing
        _testElems: _testElems // exposed for unit testing
    };
});
