/* global googletag: false */
define([
    'bonzo',
    'qwery',
    'lodash/functions/debounce',
    'lodash/arrays/flatten',
    'lodash/arrays/uniq',
    'lodash/collections/forEach',
    'lodash/collections/map',
    'lodash/functions/once',
    'lodash/objects/defaults',
    'lodash/objects/forOwn',
    'lodash/objects/isArray',
    'lodash/objects/pairs',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/_',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/commercial/keywords',
    'common/modules/commercial/tags/audience-science',
    'common/modules/commercial/tags/audience-science-gateway',
    'common/modules/commercial/tags/criteo',
    'common/modules/commercial/user-ad-targeting',
    'common/modules/experiments/ab'
], function (
    bonzo,
    qwery,
    debounce,
    flatten,
    uniq,
    forEach,
    map,
    once,
    defaults,
    forOwn,
    isArray,
    pairs,
    $,
    $css,
    _,
    globalConfig,
    cookies,
    detect,
    mediator,
    template,
    keywords,
    audienceScience,
    audienceScienceGateway,
    criteo,
    userAdTargeting,
    ab
) {

    /**
     * Right, so an explanation as to how this works...
     *
     * Create a new ad slot using the following code:
     *
     * <div class="ad-slot__dfp AD_SLOT_CLASS" data-name="AD_SLOT_NAME" data-mobile="300,50|320,50"
     *      data-desktop="300,250" data-refresh="false" data-label="false">
     *     <div id="SLOT_ID" class="ad-container"></div>
     * </div>
     *
     * You can set the set which size ad(s) should be loaded at which breakpoint by using the
     * data attribute. The available breakpoints and their sizes are listed in the config below.
     * You do not need to specify all of these. If you set a mobile size, then that size will be used
     * for all ads in that slot until another breakpoint is detected, in the above case, that's desktop.
     *
     * There is also a function for breaking the ad content out of their iframes. This can be done by
     * adding the classes below (breakoutHash) to the ad content (in DFP).
     *
     * Labels are automatically prepended to an ad that was successfully loaded.
     *
     * TODO: breakoutHash could just be one class and the script tag moved to inside the ad
     *
     */

    /**
     * Private variables
     */
    var adSlots = [],
        slotsToRefresh = [],
        config = {},
        // These should match the widths inside _vars.scss
        breakpoints = {
            mobile: 0,
            mobilelandscape: 480,
            tabletportrait: 740,
            tabletlandscape: 900,
            desktop: 980,
            wide: 1300
        },
        breakoutHash = {
            'breakout__html': '%content%',
            'breakout__script': '<script>%content%</script>'
        },
        adSlotDefinitions = {
            right: {
                sizeMappings: {
                    tabletlandscape: '300,250|300,600'
                }
            },
            im: {
                label: false,
                refresh: false,
                sizeMappings: {
                    mobile: '88,85'
                }
            },
            inline1: {
                sizeMappings: {
                    mobile: '300,50',
                    mobilelandscape: '300,50|320,50',
                    tabletportrait: '300,250'
                }
            },
            inline2: {
                sizeMappings: {
                    mobile: '300,50',
                    mobilelandscape: '300,50|320,50',
                    tabletportrait: '300,250'
                }
            },
            'merchandising-high': {
                label: false,
                refresh: false,
                sizeMappings: {
                    desktop: '88,87'
                }
            },
            spbadge: {
                label: false,
                refresh: false,
                sizeMappings: {
                    mobile: '140,90'
                }
            },
            adbadge: {
                label: false,
                refresh: false,
                sizeMappings: {
                    mobile: '140,90'
                }
            }
        };

    /**
     * Private functions
     */
    var parseAd = function(event) {
            var $slot = $('#' + event.slot.getSlotId().getDomId());

            if (event.isEmpty) {
                removeLabel($slot);
            } else {
                checkForBreakout($slot);
                addLabel($slot);
            }
        },
        addLabel = function($slot) {
            if (shouldRenderLabel($slot)) {
                $slot.prepend('<div class="ad-slot__label" data-test-id="ad-slot-label">Advertisement</div>');
            }
        },
        removeLabel = function($slot) {
            $('.ad-slot__label', $slot).remove();
        },
        shouldRenderLabel = function ($slot) {
            return $slot.data('label') !== false && qwery('.ad-slot__label', $slot[0]).length === 0;
        },
        /**
         * Checks the contents of the ad for special classes (see breakoutHash).
         *
         * If one of these classes is detected, then the contents of that iframe is retrieved
         * and written onto the parent page.
         *
         * Currently this is being used for sponsored logos and commercial components so they
         * can inherit fonts.
         */
        checkForBreakout = function($slot) {
            /* jshint evil: true */
            var iFrame = qwery('iframe', $slot[0])[0];

            if (iFrame) {

                var frameContents = iFrame.contentDocument.body;

                for (var cls in breakoutHash) {
                    var $el = $('.' + cls, frameContents);

                    if ($el.length > 0) {
                        if ($el[0].nodeName.toLowerCase() === 'script') {
                            // evil, but we own the returning js snippet
                            eval($el.html());
                        } else {
                            $slot
                                .html('')
                                .first()
                                .append(breakoutHash[cls].replace(/%content%/g, $el.html()));
                        }
                    }
                }

            }
        },
        refresh = function() {
            googletag.pubads().refresh(slotsToRefresh);
        },
        /** A breakpoint can have various sizes assigned to it. You can assign either on
         * set of sizes or multiple.
         *
         * One size       - `data-mobile="300,50"`
         * Multiple sizes - `data-mobile="300,50|320,50"`
         */
        createSizeMapping = function (attr) {
            return map(attr.split('|'), function(size) {
                return map(size.split(','), Number);
            });
        },
        /**
         * Builds and assigns the correct size map for a slot based on the breakpoints
         * attached to the element via data attributes.
         *
         * A new size map is created for a given slot. We then loop through each breakpoint
         * defined in the config, checking if that breakpoint has been set on the slot.
         *
         * If it has been defined, then we add that size to the size mapping.
         *
         */
        defineSlotSizes = function(slot) {
            var mapping = googletag.sizeMapping();

            for (var breakpoint in breakpoints) {
                var attr  = slot.data(breakpoint),
                    width = breakpoints[breakpoint];

                if (attr) {
                    mapping.addSize([width, 0], createSizeMapping(attr));
                }
            }

            return mapping.build();
        },
        abParam = function() {
            var hchTest = ab.getParticipations().HighCommercialComponent;
            if (hchTest) {
                switch (hchTest.variant) {
                    case 'control':
                        return '1';
                    case 'variant':
                        return '2';
                }
            }
            return '3';
        },
        /**
         * Builds the appropriate page level targeting
         *
         * a      = audience science
         * at     = adtest cookie
         * bp     = current breakpoint
         * cat    = section
         * ct     = content type
         * k      = keywords
         * p      = platform
         * pt     = content type
         * url    = path
         */
        buildPageTargeting = function (config) {

            function encodeTargetValue(value) {
                return value ? keywords.format(value).replace(/&/g, 'and').replace(/'/g, '') : '';
            }

            var page        = config.page,
                section     = encodeTargetValue(page.section),
                series      = encodeTargetValue(page.series),
                contentType = encodeTargetValue(page.contentType),
                edition     = encodeTargetValue(page.edition),
                mediaSource = encodeTargetValue(page.source);

            return defaults({
                url     : window.location.pathname,
                edition : edition,
                cat     : section,
                se      : series,
                ct      : contentType,
                pt      : contentType,
                p       : 'ng',
                k       : parseKeywords(page.keywordIds || page.pageId),
                su      : page.isSurging,
                bp      : detect.getBreakpoint(),
                a       : audienceScience.getSegments(),
                at      : cookies.get('adtest') || cookies.get('GU_TEST') || '',
                gdncrm  : userAdTargeting.getUserSegments(),
                ab      : abParam(),
                co      : parseTargets(page.authorIds),
                bl      : parseKeywords(page.blogIds),
                ms      : mediaSource,
                tn      : parseTargets(page.tones)
            }, audienceScienceGateway.getSegments(), criteo.getSegments());
        },
        createAdSlot = function(name, types, keywords) {
            var definition = adSlotDefinitions[name],
                dataAttrs = {
                    refresh: definition.refresh !== undefined ? definition.refresh : true,
                    label: definition.label !== undefined ? definition.label : true
                },
                $adSlot = $.create(template(
                    '<div id="dfp-ad--{{name}}" ' +
                        'class="ad-slot ad-slot--dfp ad-slot--{{name}} {{types}}" ' +
                        'data-link-name="ad slot {{name}}" ' +
                        'data-test-id="ad-slot-{{name}}" ' +
                        'data-name="{{name}}"' +
                        '{{sizeMappings}}></div>',
                    {
                        name: name,
                        types: map((isArray(types) ? types : [types]), function(type) { return 'ad-slot--' + type; }).join(' '),
                        sizeMappings: map(pairs(definition.sizeMappings), function(size) { return ' data-' + size[0] + '="' + size[1] + '"'; }).join('')
                    }));
            for (var attrName in dataAttrs) {
                if (dataAttrs[attrName] === false) {
                    $adSlot.attr('data-' + attrName, 'false');
                }
            }
            if (keywords) {
                $adSlot.attr('data-keywords', keywords);
            }
            return $adSlot[0];
        },
        parseKeywords = function(keywords) {
            return map((keywords || '') .split(','), function (keyword) {
                return keyword.split('/').pop();
            });
        },
        parseTargets = function(targets) {
            var targetArray = parseKeywords(targets);
            return map(targetArray, function(target) {
                return keywords.format(target);
            });
        };

    /**
     * Initial commands
     */
    var setListeners = function() {
            googletag.pubads().addEventListener('slotRenderEnded', parseAd);
        },
        setPageTargeting = function() {
            forOwn(buildPageTargeting(config), function(value, key) {
                googletag.pubads().setTargeting(key, value);
            });
        },
        /**
         * Loop through each slot detected on the page and define it based on the data
         * attributes on the element.
         */
        defineSlots = function() {

            var adUnit = config.page.adUnit;

            forEach(adSlots, function($adSlot) {

                var id          = $adSlot.attr('id'),
                    sizeMapping = defineSlotSizes($adSlot),
                    // as we're using sizeMapping, pull out all the ad sizes, as an array of arrays
                    size        = uniq(
                        flatten(sizeMapping, true, function(map) {
                            return map[1];
                        }),
                        function(size) {
                            return size[0] + '-' + size[1];
                        }
                    ),
                    slot = ($adSlot.data('out-of-page')
                            ? googletag.defineOutOfPageSlot(adUnit, id) : googletag.defineSlot(adUnit, size, id))
                        .addService(googletag.pubads())
                        .defineSizeMapping(sizeMapping)
                        .setTargeting('slot', $adSlot.data('name'));

                if ($adSlot.data('keywords')) {
                    slot.setTargeting('k', parseKeywords($adSlot.data('keywords')));
                }

                // Add to the array of ads to be refreshed (when the breakpoint changes)
                // only if it's `data-refresh` attribute isn't set to false.
                if ($adSlot.data('refresh') !== false) {
                    slotsToRefresh.push(slot);
                }
            });
        },
        fireAdRequest = function() {
            googletag.pubads().enableSingleRequest();
            googletag.pubads().collapseEmptyDivs();
            googletag.enableServices();
            // as this is an single request call, only need to make a single display call (to the first ad slot)
            googletag.display(adSlots.shift().attr('id'));
        },
        postDisplay = function() {
            var hasBreakpointChanged = detect.hasCrossedBreakpoint();
            mediator.on('window:resize',
                debounce(function () {
                    // refresh on resize
                    hasBreakpointChanged(refresh);
                }, 2000)
            );
        };

    /**
     * Initialisation function
     */
    var init = function (c) {

        config = defaults(
            c || {},
            globalConfig,
            {
                adSlotSelector: '.ad-slot--dfp',
                page: {},
                switches: {}
            }
        );

        if (!config.switches.standardAdverts && !config.switches.commercialComponents) {
            return false;
        }

        if (!config.switches.standardAdverts) {
            config.adSlotSelector = '.ad-slot--commercial-component';
        } else if (!config.switches.commercialComponents) {
            config.adSlotSelector = '.ad-slot--dfp:not(.ad-slot--commercial-component)';
        }

        adSlots = _(qwery(config.adSlotSelector))
            // filter out hidden ads
            .map(function (adSlot) {
                return bonzo(adSlot);
            })
            .filter(function ($adSlot) {
                return $css($adSlot, 'display') !== 'none';
            })
            .valueOf();

        if (adSlots.length > 0) {
            // if we don't already have googletag, create command queue and load it async
            if (!window.googletag) {
                window.googletag = { cmd: [] };
                // load the library asynchronously
                require(['googletag']);
            }

            window.googletag.cmd.push(setListeners);
            window.googletag.cmd.push(setPageTargeting);
            window.googletag.cmd.push(defineSlots);
            window.googletag.cmd.push(fireAdRequest);
            // anything we want to happen after displaying ads
            window.googletag.cmd.push(postDisplay);
        }

        return dfp;

    };

    var dfp = {

        init: once(init),

        getAdSlots: function() {
            return adSlots;
        },

        buildPageTargeting: buildPageTargeting,

        createAdSlot: createAdSlot,

        // really only useful for testing
        reset: function() {
            adSlots = [];
            slotsToRefresh = [];
            dfp.init = once(init);
            return adSlots;
        }

    };

    return dfp;

});
