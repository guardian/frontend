/* global googletag: false */
define([
    'common/$',
    'bonzo',
    'qwery',
    'lodash/functions/debounce',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/analytics/commercial/tags/common/audience-science',
    'common/modules/analytics/commercial/tags/common/audience-science-gateway',
    'common/modules/analytics/commercial/tags/common/criteo',
    'common/modules/adverts/query-string',
    'lodash/arrays/flatten',
    'lodash/arrays/uniq',
    'lodash/functions/once',
    'lodash/objects/defaults'
], function (
    $,
    bonzo,
    qwery,
    debounce,
    cookies,
    detect,
    mediator,
    audienceScience,
    audienceScienceGateway,
    criteo,
    queryString,
    flatten,
    uniq,
    once,
    defaults
) {

    /**
     * Right, so an explanation as to how this works...
     *
     * Create a new ad slot using the following code:
     *
     * <div class="ad-slot__dfp AD_SLOT_CLASS" data-name="AD_SLOT_NAME" data-mobile="300,50|320,50" data-desktop="300,250" data-refresh="false" data-label="false">
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
                $slot.parent()
                    .prepend('<div class="ad-slot__label">Advertisement</div>')
                    .addClass('ad-label--showing');
            }
        },
        removeLabel = function($slot) {
            var $slotParent = $slot.parent()
                .removeClass('ad-label--showing');
            $('.ad-slot__label', $slotParent[0]).remove();
        },
        shouldRenderLabel = function ($slot) {
            var $parent = $slot.parent();
            return !($slot[0].style.display === 'none' || $parent.hasClass('ad-label--showing') || $parent.data('label') === false);
        },
        /**
         * Checks the contents of the ad for special classes (see breakoutHash).
         *
         * If one of these classes is detected, then the contents of that iframe is retrieved
         * and written onto the parent page.
         *
         * Currently this is being used for sponsered logos and commercial components so they
         * can inherit fonts.
         */
        checkForBreakout = function($slot) {
            /* jshint evil: true */
            var iFrame = $slot[0].querySelector('iframe');
            if (iFrame) {

                var frameContents = iFrame.contentDocument.body;

                for (var cls in breakoutHash) {
                    var $el = bonzo(frameContents.querySelector('.' + cls));

                    if ($el.length > 0) {
                        if ($el[0].nodeName.toLowerCase() === 'script') {
                            // evil, but we own the returning js snippet
                            eval($el.html());
                        } else {
                            $slot.html('');
                            $slot.first().append(breakoutHash[cls].replace(/%content%/g, $el.html()));
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
            return attr.split('|').map(function(size) {
                return size.split(',').map(Number);
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
                var attr  = slot.getAttribute('data-' + breakpoint),
                    width = breakpoints[breakpoint];

                if (attr) {
                    mapping.addSize([width, 0], createSizeMapping(attr));
                }
>>>>>>> change dfp to object, rather than class
            }

            return mapping.build();
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
        buildPageTargeting = function () {

            function encodeTargetValue(value) {
                return value ? queryString.formatKeyword(value).replace(/&/g, 'and').replace(/'/g, '') : '';
            }

            var conf        = config.page,
                section     = encodeTargetValue(conf.section),
                series      = encodeTargetValue(conf.series),
                contentType = encodeTargetValue(conf.contentType),
                edition     = encodeTargetValue(conf.edition),
                keywords;
            if (conf.keywords) {
                keywords = conf.keywords.split(',').map(function (keyword) {
                    return encodeTargetValue(keyword);
                });
            } else {
                keywords = '';
            }

            return _defaults({
                url     : window.location.pathname,
                edition : edition,
                cat     : section,
                se      : series,
                k       : keywords,
                ct      : contentType,
                pt      : contentType,
                p       : 'ng',
                bp      : detect.getBreakpoint(),
                a       : AudienceScience.getSegments(),
                at      : Cookies.get('adtest') || ''
            }, AudienceScienceGateway.getSegments(), criteo.getSegments());
        },
        buildAdUnit = function () {
            var isFront      = config.page.isFront || config.page.contentType === 'Section',
                section      = config.page.section,
                adUnitSuffix = section;
            if (isFront) {
                if (section !== '') {
                    adUnitSuffix += '/';
                }
                adUnitSuffix += 'front';
            }
            return '/' + config.page.dfpAccountId + '/' + config.page.dfpAdUnitRoot + '/' + adUnitSuffix;
        };

    /**
     * Initial commands
     */
    var setListeners = function() {
            googletag.pubads().addEventListener('slotRenderEnded', parseAd);
        },
        setPageTargeting = function() {
            var targets = buildPageTargeting();
            for (var target in targets) {
                if (targets.hasOwnProperty(target)) {
                    googletag.pubads().setTargeting(target, targets[target]);
                }
            }
        },
        /**
         * Loop through each slot detected on the page and define it based on the data
         * attributes on the element.
         */
        defineSlots = function() {

            var adUnit = buildAdUnit(config);

            adSlots.forEach(function($adSlot) {

                var id          = $(config.adContainerClass, $adSlot[0]).attr('id'),
                    sizeMapping = defineSlotSizes($adSlot[0]),
                    // as we're using sizeMapping, pull out all the ad sizes, as an array of arrays
                    size        = uniq(
                        flatten(sizeMapping, true, function(map) {
                            return map[1];
                        }),
                        function(size) {
                            return size[0] + '-' + size[1];
                        }
                    ),
                    slot = googletag
                        .defineSlot(adUnit, size, id)
                        .addService(googletag.pubads())
                        .defineSizeMapping(sizeMapping)
                        .setTargeting('slot', $adSlot.data('name'));

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
            googletag.display($(config.adContainerClass, adSlots.shift()).attr('id'));
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

        config = defaults(c || {}, {
            adSlotSelector: '.ad-slot--dfp',
            adContainerClass: '.ad-slot__container',
            page: {},
            switches: {}
        });

        adSlots = qwery(config.adSlotSelector)
            // filter out hidden ads
            .map(function (adSlot) {
                return bonzo(adSlot);
            })
            .filter(function ($adSlot) {
                return $adSlot.css('display') !== 'none';
            });

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
