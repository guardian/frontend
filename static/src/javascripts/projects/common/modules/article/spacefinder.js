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
    // find spaces in articles for inserting ads and other inline content
    // minAbove and minBelow are measured in px from the top of the paragraph element being tested
    var defaultRules = { // these are written for adverts
        bodySelector: '.js-article__body',
        slotSelector: ' > p',
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
    },
    imagesLoaded,
    richLinksUpgraded;

    function onImagesLoaded(body) {
        var notLoaded = filter(qwery('img', body), function (img) {
            return !img.complete;
        });

        return imagesLoaded || (imagesLoaded = Promise.race([
            Promise.all(map(notLoaded, function (img) {
                return new Promise(function (resolve) {
                    bean.on(img, 'load', resolve);
                });
            })),
            new Promise(function (resolve) {
                window.setTimeout(resolve, 5000);
            })
        ]));
    }

    function onRichLinksUpgraded(body) {
        return richLinksUpgraded || (richLinksUpgraded = Promise.race([
            new Promise(function (resolve, reject) {
                var unloaded = qwery('.element-rich-link--not-upgraded', body);

                if (!unloaded.length) {
                    resolve();
                } else {
                    reject();
                }
            }).catch(function () {
                return new Promise(function (resolve) {
                    mediator.once('rich-link:loaded', resolve);
                });
            }),
            new Promise(function (resolve) {
                window.setTimeout(resolve, 5000);
            })
        ]));
    }

    // test one element vs another for the given rules
    function _testElem(rules, elem, other) {
        var isMinAbove = elem.top - other.bottom >= rules.minAbove,
            isMinBelow = other.top - elem.top >= rules.minBelow;

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

    function _enforceRules(slots, rules, bodyHeight) {
        var filtered;

        // enforce minAbove and minBelow rules
        filtered = Promise.resolve(filter(slots, function (slot) {
            var farEnoughFromTopOfBody = slot.top >= rules.minAbove,
                farEnoughFromBottomOfBody = slot.top + rules.minBelow <= bodyHeight;
            return farEnoughFromTopOfBody && farEnoughFromBottomOfBody;
        }));

        // enforce content meta rule
        if (rules.clearContentMeta) {
            filtered = filtered.then(function (slots) {
                return fastdom.read(function () {
                    return _mapElementToDimensions(qwery('.js-content-meta')[0]);
                }).then(function (contentMeta) {
                    return filter(slots, function (slot) {
                        return slot.top > (contentMeta.bottom + rules.clearContentMeta);
                    });
                });
            });
        }

        // enforce selector rules
        if (rules.selector) {
            forOwn(rules.selectors, function (params, selector) {
                filtered = filtered.then(function (slots) {
                    return fastdom.read(function () {
                        return map(qwery(rules.bodySelector + selector), _mapElementToDimensions);
                    }).then(function (relevantElems) {
                        return filter(slots, function (slot) {
                            return _testElems(params, slot, relevantElems);
                        });
                    });
                });
            });
        }

        return filtered;
    }

    function getReady(body) {
        if (config.switches.viewability) {
            return Promise.all([onImagesLoaded(body), onRichLinksUpgraded(body)]);
        }

        return Promise.resolve(true);
    }

    // Rather than calling this directly, use spaceFiller to inject content into the page.
    // SpaceFiller will safely queue up all the various asynchronous DOM actions to avoid any race conditions.
    function findSpace(rules) {
        var body;

        rules = rules || defaultRules;
        body = rules.bodySelector ? document.querySelector(rules.bodySelector) : document;

        // get all immediate children
        return getReady(body).then(function () {
            return fastdom.read(getSlots)
            .then(enforceRules)
            .then(filterSlots)
            .then(returnSlots);
        });

        function getSlots() {
            var bodyBottom = body.offsetHeight;
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
            slots = map(slots, _mapElementToDimensions);
            return [bodyBottom, slots];
        }

        function enforceRules(data) {
            return _enforceRules(data[1], rules, data[0]);
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
