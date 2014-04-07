/* global googletag: false */
define([
    'common/$',
    'bonzo',
    'qwery',
    'common/modules/component',
    'lodash/objects/assign',
    'lodash/functions/debounce',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/analytics/commercial/tags/common/audience-science',
    'common/modules/analytics/commercial/tags/common/audience-science-gateway',
    'common/modules/analytics/commercial/tags/common/criteo',
    'common/modules/adverts/userAdTargeting',
    'common/modules/adverts/query-string',
    'lodash/arrays/flatten',
    'lodash/arrays/uniq'
], function (
    $,
    bonzo,
    qwery,
    Component,
    extend,
    debounce,
    Cookies,
    detect,
    mediator,
    AudienceScience,
    AudienceScienceGateway,
    Criteo,
    UserAdTargeting,
    queryString,
    _flatten,
    _uniq
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

    var breakoutHash = {
        'breakout__html': '%content%',
        'breakout__script': '<script>%content%</script>'
    };

    /** A breakpoint can have various sizes assigned to it. You can assign either on
     * set of sizes or multiple.
     *
     * One size       - `data-mobile="300,50"`
     * Multiple sizes - `data-mobile="300,50|320,50"`
     */
    function createSizeMapping(attr) {
        return attr.split('|').map(function(size) {
            return size.split(',').map(Number);
        });
    }

    function shouldRenderLabel($slot) {
        var $parent = $slot.parent();
        return !($slot[0].style.display === 'none' || $parent.hasClass('ad-label--showing') || $parent.data('label') === false);
    }

    function DFP(config) {
        this.config       = extend(this.config, config);
        this.context      = document;
        this.$dfpAdSlots  = [];
        this.adsToRefresh = [];
    }

    Component.define(DFP);

    DFP.prototype.config = {
        dfpSelector: '.ad-slot--dfp',
        adContainerClass: '.ad-slot__container',
        // These should match the widths inside _vars.scss
        breakpoints: {
            mobile: 0,
            tabletportrait: 740,
            tabletlandscape: 900,
            desktop: 980,
            wide: 1300
        }
    };

    DFP.prototype.setListeners = function() {
        googletag.pubads().addEventListener('slotRenderEnded', this.parseAd.bind(this));
    };

    DFP.prototype.buildAdUnit = function () {
        var isFront      = this.config.page.isFront || this.config.page.contentType === 'Section',
            section      = this.config.page.section,
            adUnitSuffix = section;
        if (isFront) {
            if (section !== '') {
                adUnitSuffix += '/';
            }
            adUnitSuffix += 'front';
        }
        return '/' + this.config.page.dfpAccountId + '/' + this.config.page.dfpAdUnitRoot + '/' + adUnitSuffix;
    };

    /**
     * Builds the appropriate page level targetting
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
    DFP.prototype.buildPageTargetting = function () {
        var conf        = this.config.page,
            section     = conf.section ? conf.section.toLowerCase() : '',
            contentType = conf.contentType ? conf.contentType.toLowerCase() : '',
            edition     = conf.edition ? conf.edition.toLowerCase() : '',
            keywords;
        if (conf.keywords) {
            keywords = conf.keywords.split(',').map(function (keyword) {
                return queryString.formatKeyword(keyword).replace('&', 'and');
            });
        } else {
            keywords = '';
        }

        var targets = {
            'url'     : window.location.pathname,
            'edition' : edition,
            'cat'     : section,
            'k'       : keywords,
            'ct'      : contentType,
            'pt'      : contentType,
            'p'       : 'ng',
            'bp'      : detect.getBreakpoint(),
            'a'       : AudienceScience.getSegments(),
            'at'      : Cookies.get('adtest') || ''
        };
        extend(targets, AudienceScienceGateway.getSegments());
        extend(targets, Criteo.getSegments());

        return targets;
    };

    DFP.prototype.setPageTargetting = function() {
        var targets = this.buildPageTargetting();
        for (var target in targets) {
            if (targets.hasOwnProperty(target)) {
                googletag.pubads().setTargeting(target, targets[target]);
            }
        }
    };

    /**
     * Loop through each slot detected on the page and define it based on the data
     * attributes on the element.
     */
    DFP.prototype.defineSlots = function() {

        var adUnit = this.buildAdUnit(this.config);

        this.$dfpAdSlots.each(function(adSlot) {

            var id          = adSlot.querySelector(this.config.adContainerClass).id,
                name        = adSlot.getAttribute('data-name'),
                sizeMapping = this.defineSlotSizes(adSlot),
                // as we're using sizeMapping, pull out all the ad sizes, as an array of arrays
                size        = _uniq(
                                  _flatten(sizeMapping, true, function(map) {
                                      return map[1];
                                  }),
                                  function(size) {
                                      return size[0] + '-' + size[1];
                                  }
                              ),
                refresh     = adSlot.getAttribute('data-refresh') !== 'false',

                slot = googletag.defineSlot(adUnit, size, id)
                                .addService(googletag.pubads())
                                .defineSizeMapping(sizeMapping)
                                .setTargeting('slot', name);

            // Add to the array of ads to be refreshed (when the breakpoint changes)
            // only if it's `data-refresh` attribute isn't set to false.
            if (refresh) {
                this.adsToRefresh.push(slot);
            }
        }, this);
    };

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
    DFP.prototype.defineSlotSizes = function(slot) {
        var mapping = googletag.sizeMapping();

        for (var breakpoint in this.config.breakpoints) {
            var attr  = slot.getAttribute('data-' + breakpoint),
                width = this.config.breakpoints[breakpoint];

            if (attr) {
                mapping.addSize([width, 0], createSizeMapping(attr));
            }
        }

        return mapping.build();
    };

    DFP.prototype.parseAd = function(event) {
        var $slot = $('#' + event.slot.getSlotId().getDomId());

        if (event.isEmpty) {
            this.removeLabel($slot);
        } else {
            this.checkForBreakout($slot);
            this.addLabel($slot);
        }

    };

    /**
     * Checks the contents of the ad for special classes (see breakoutHash).
     *
     * If one of these classes is detected, then the contents of that iframe is retrieved
     * and written onto the parent page.
     *
     * Currently this is being used for sponsered logos and commercial components so they
     * can inherit fonts.
     */
    DFP.prototype.checkForBreakout = function($slot) {
        /* jshint evil: true */
        var frameContents = $slot[0].querySelector('iframe').contentDocument.body;

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
    };

    DFP.prototype.addLabel = function($slot) {
        if (shouldRenderLabel($slot)) {
            $slot.parent()
                .prepend('<div class="ad-slot__label">Advertisement</div>')
                .addClass('ad-label--showing');
        }
    };

    DFP.prototype.removeLabel = function($slot) {
        $slot.parent()
            .removeClass('ad-label--showing')
            .previous().remove();
    };

    DFP.prototype.fireAdRequest = function() {
        googletag.pubads().enableSingleRequest();
        googletag.pubads().enableAsyncRendering();
        googletag.pubads().collapseEmptyDivs();
        googletag.enableServices();
        googletag.display(this.$dfpAdSlots[0].querySelector(this.config.adContainerClass).id);
    };

    DFP.prototype.reload = function() {
        googletag.pubads().refresh(this.adsToRefresh);
    };

    DFP.prototype.init = function() {

        this.$dfpAdSlots = $(this.config.dfpSelector);

        // If there's no ads on the page, then don't load anything
        if (this.$dfpAdSlots.length === 0) {
            return false;
        }

        // if we don't already have googletag, load it and create command queue
        if (!window.googletag) {
            // load the library asynchronously
            require(['googletag']);
            window.googletag = { cmd: [] };
        }

        window.googletag.cmd.push(this.setListeners.bind(this));
        window.googletag.cmd.push(this.setPageTargetting.bind(this));
        window.googletag.cmd.push(this.defineSlots.bind(this));
        window.googletag.cmd.push(this.fireAdRequest.bind(this));
    };

    return DFP;

});
