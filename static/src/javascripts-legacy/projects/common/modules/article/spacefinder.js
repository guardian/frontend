define([
    'qwery',
    'bean',
    'lib/fastdom-promise',
    'lib/config',
    'lib/mediator',
    'commercial/modules/dfp/track-ad-render',
    'lodash/functions/memoize'
], function (
    qwery,
    bean,
    fastdom,
    config,
    mediator,
    trackAdRender,
    memoize
) {
    // total_hours_spent_maintaining_this = 64
    //
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

    var defaultOptions = {
        waitForImages: true,
        waitForLinks: true,
        waitForInteractives: false,
        waitForAds: false
    };

    function expire(resolve) {
        window.setTimeout(resolve, LOADING_TIMEOUT);
    }

    function getFuncId(rules) {
        return rules.bodySelector || 'document';
    }

    var onImagesLoaded = memoize(function (rules) {
        var notLoaded = qwery('img', rules.body).filter(function (img) {
            return !img.complete;
        });

        return notLoaded.length === 0 ?
            true :
            new Promise(function (resolve) {
                var loadedCount = 0;
                bean.on(rules.body, 'load', notLoaded, function onImgLoaded() {
                    loadedCount += 1;
                    if (loadedCount === notLoaded.length) {
                        bean.off(rules.body, 'load', onImgLoaded);
                        notLoaded = null;
                        resolve();
                    }
                });
            });
    }, getFuncId);

    var onRichLinksUpgraded = memoize(function (rules) {
        return qwery('.element-rich-link--not-upgraded', rules.body).length === 0 ?
            true :
            new Promise(function (resolve) {
                mediator.once('rich-link:loaded', resolve);
            });
    }, getFuncId);

    var onInteractivesLoaded = memoize(function (rules) {
        var notLoaded = qwery('.element-interactive', rules.body).filter(function (interactive) {
            var iframe = qwery(interactive.children).filter(isIframe);
            return !(iframe.length && isIframeLoaded(iframe[0]));
        });

        return notLoaded.length === 0 || !('MutationObserver' in window) ?
            true :
            Promise.all(notLoaded.map(function (interactive) {
                return new Promise(function (resolve) {
                    new MutationObserver(function (records, instance) {
                        if (!(records.length > 0 &&
                            records[0].addedNodes.length > 0 &&
                            isIframe(records[0].addedNodes[0]))
                        ) {
                            return;
                        }

                        var iframe = records[0].addedNodes[0];
                        if (isIframeLoaded(iframe)) {
                            instance.disconnect();
                            resolve();
                        } else {
                            iframe.addEventListener('load', function () {
                                instance.disconnect();
                                resolve();
                            });
                        }
                    }).observe(interactive, { childList: true });
                });
            }));

        function isIframe(node) {
            return node.nodeName === 'IFRAME';
        }

        function isIframeLoaded(iframe) {
           try {
               return iframe.contentWindow &&
                   iframe.contentWindow.document &&
                   iframe.contentWindow.document.readyState === 'complete';
           } catch(err) {
               return true;
           }
        }
    }, getFuncId);

    var onAdsLoaded = memoize(function (rules) {
        return Promise.all(qwery('.js-ad-slot', rules.body)
            .map(function (ad) { return ad.id; })
            .map(trackAdRender)
        );
    }, getFuncId);

    // test one element vs another for the given rules
    function _testCandidate(rules, challenger, opponent) {
        var isMinAbove = challenger.top - opponent.bottom >= rules.minAbove;
        var isMinBelow = opponent.top - challenger.top >= rules.minBelow;

        return isMinAbove || isMinBelow;
    }

    // test one element vs an array of other elements for the given rules
    function _testCandidates(rules, challenger, opponents) {
        return opponents.every(_testCandidate.bind(undefined, rules, challenger));
    }

    function _mapElementToComputedDimensions(el) {
        var rect = el.getBoundingClientRect();
        return {
            top: rect.top,
            bottom: rect.bottom,
            element: el
        };
    }

    function _mapElementToDimensions(el) {
        return {
            top: el.offsetTop,
            bottom: el.offsetTop + el.offsetHeight,
            element: el
        };
    }

    function _enforceRules(data, rules) {
        var candidates = data.candidates;

        // enforce absoluteMinAbove rule
        if (rules.absoluteMinAbove) {
            candidates = candidates.filter(function (candidate) {
                return candidate.top >= rules.absoluteMinAbove;
            });
        }

        // enforce minAbove and minBelow rules
        candidates = candidates.filter(function (candidate) {
            var farEnoughFromTopOfBody = candidate.top >= rules.minAbove;
            var farEnoughFromBottomOfBody = candidate.top + rules.minBelow <= data.bodyHeight;
            return farEnoughFromTopOfBody && farEnoughFromBottomOfBody;
        });

        // enforce content meta rule
        if (rules.clearContentMeta) {
            candidates = candidates.filter(function (candidate) {
                return candidate.top > (data.contentMeta.bottom + rules.clearContentMeta);
            });
        }

        // enforce selector rules
        if (rules.selectors) {
            Object.keys(rules.selectors).forEach(function (selector) {
                candidates = candidates.filter(function (candidate) {
                    return _testCandidates(rules.selectors[selector], candidate, data.opponents[selector]);
                });
            });
        }

        if (rules.filter) {
            candidates = candidates.filter(rules.filter, rules);
        }

        return candidates;
    }

    function SpaceError(rules) {
        this.name = 'SpaceError';
        this.message = 'There is no space left matching rules from ' + rules.bodySelector;
        this.stack = (new Error()).stack;
    }

    // Rather than calling this directly, use spaceFiller to inject content into the page.
    // SpaceFiller will safely queue up all the various asynchronous DOM actions to avoid any race conditions.
    function findSpace(rules, options) {
        var getDimensions;

        rules || (rules = defaultRules);
        options || (options = defaultOptions);
        rules.body = rules.bodySelector ? document.querySelector(rules.bodySelector) : document;
        getDimensions = rules.absoluteMinAbove ? _mapElementToComputedDimensions : _mapElementToDimensions;

        return getReady()
        .then(getCandidates)
        .then(getMeasurements)
        .then(enforceRules)
        .then(returnCandidates);

        function getReady() {
            return Promise.race([
                new Promise(expire),
                Promise.all([
                    options.waitForImages ? onImagesLoaded(rules) : true,
                    options.waitForLinks ? onRichLinksUpgraded(rules) : true,
                    options.waitForInteractives ? onInteractivesLoaded(rules) : true,
                    options.waitForAds ? onAdsLoaded(rules) : true
                ])
            ]);
        }

        function getCandidates() {
            var candidates = qwery(rules.bodySelector + rules.slotSelector);
            if (rules.fromBottom) {
                candidates.reverse();
            }
            if (rules.startAt) {
                var drop = true;
                candidates = candidates.filter(function (candidate) {
                    if (candidate === rules.startAt) {
                        drop = false;
                    }
                    return !drop;
                });
            }
            if (rules.stopAt) {
                var keep = true;
                candidates = candidates.filter(function (candidate) {
                    if (candidate === rules.stopAt) {
                        keep = false;
                    }
                    return keep;
                });
            }
            return candidates;
        }

        function getMeasurements(candidates) {
            var contentMeta = rules.clearContentMeta ?
                document.querySelector('.js-content-meta') :
                null;
            var opponents = rules.selectors ?
                Object.keys(rules.selectors).map(function (selector) {
                    return [selector, qwery(rules.bodySelector + selector)];
                }) :
                null;

            return fastdom.read(function () {
                var bodyDims = rules.body.getBoundingClientRect();
                var candidatesWithDims = candidates.map(getDimensions);
                var contentMetaWithDims = rules.clearContentMeta ?
                    getDimensions(contentMeta) :
                    null;
                var opponentsWithDims = opponents ?
                    opponents.reduce(function (result, selectorAndElements) {
                        result[selectorAndElements[0]] = selectorAndElements[1].map(getDimensions);
                        return result;
                    }, {}) :
                    null;

                if (rules.absoluteMinAbove) {
                    rules.absoluteMinAbove -= bodyDims.top;
                }

                return {
                    bodyHeight: bodyDims.height,
                    candidates: candidatesWithDims,
                    contentMeta: contentMetaWithDims,
                    opponents: opponentsWithDims
                };
            });
        }

        function enforceRules(data) {
            return _enforceRules(data, rules);
        }

        function returnCandidates(candidates) {
            if (candidates.length) {
                return candidates.map(function (candidate) { return candidate.element; });
            } else {
                throw new SpaceError(rules);
            }
        }
    }

    return {
        findSpace: findSpace,
        SpaceError: SpaceError,

        _testCandidate: _testCandidate, // exposed for unit testing
        _testCandidates: _testCandidates // exposed for unit testing
    };
});
