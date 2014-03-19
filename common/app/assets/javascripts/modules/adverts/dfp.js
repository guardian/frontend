/* global googletag: false */
define([
    'common/$',
    'bonzo',
    'postscribe',
    'common/modules/component',
    'lodash/objects/assign',
    'lodash/functions/debounce',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/analytics/commercial/tags/common/audience-science',
    'common/modules/adverts/userAdTargeting',
    'common/modules/adverts/dfp-events'
], function (
    $,
    bonzo,
    postscribe,
    Component,
    extend,
    debounce,
    Cookies,
    detect,
    mediator,
    AudienceScience,
    UserAdTargeting,
    DFPEvents
) {

    /**
     * <div class="ad-slot__dfp AD_SLOT_CLASS" data-name="AD_SLOT_NAME" data-size="300,250">
     *     <div id="SLOT_ID" class="ad-container"></div>  <-- preferably generate this
     * </div>
     */

    var breakoutHash = {
        'breakout__html': '%content%',
        'breakout__script': '<script>%content%</script>'
    };

    function DFP(config) {
        this.context = document;
        this.config = extend(this.config, config);
    }

    Component.define(DFP);

    DFP.prototype.dfpAdSlots   = [];
    DFP.prototype.adsToRefresh = [];

    DFP.prototype.config = {
        dfpUrl: '//www.googletagservices.com/tag/js/gpt.js',
        adContainerClass: '.ad-container',
        breakpoints: {
            mobile: 0,
            tabletportrait: 740,
            tabletlandscape: 900,
            desktop: 980,
            wide: 1300
        }
    };

    DFP.prototype.setListeners = function() {
        googletag.on('gpt-slot_rendered', this.parseAd.bind(this));
    };

    DFP.prototype.setPageTargetting = function() {
        var conf         = this.config.page,
            keywords     = conf.keywords    ? conf.keywords.split(',')       : '',
            section      = conf.section     ? conf.section.toLowerCase()     : '',
            contentType  = conf.contentType ? conf.contentType.toLowerCase() : '';

        googletag.pubads().setTargeting('a', AudienceScience.getSegments() || [])
                          .setTargeting('at', Cookies.get('adtest') || '')
                          .setTargeting('bp', detect.getBreakpoint())
                          .setTargeting('cat', section)
                          .setTargeting('ct', contentType)
                          .setTargeting('gdncrm', UserAdTargeting.getUserSegments() || [])
                          .setTargeting('k', keywords)
                          .setTargeting('p', detect.getBreakpoint())
                          .setTargeting('pt', contentType);
    };

    DFP.prototype.defineSlots = function() {
        var self    = this,
            section = this.config.page.isFront ? 'networkfront' : this.config.page.section,
            account = '/'+ this.config.page.dfpAccountId +'/'+ this.config.page.dfpServer +'/'+ section;

        this.dfpAdSlots.each(function(adSlot) {

            var id          = adSlot.querySelector(self.config.adContainerClass).id,
                name        = adSlot.getAttribute('data-name'),
                sizeMapping = self.defineSlotSizes(adSlot),
                sizes       = [sizeMapping[0][1][0], sizeMapping[0][1][1]],
                refresh     = adSlot.getAttribute('data-refresh') !== 'false',

                slot = googletag.defineSlot(account, sizes, id)
                                .addService(googletag.pubads())
                                .defineSizeMapping(sizeMapping)
                                .setTargeting('slot', name);

            if(refresh) {
                self.adsToRefresh.push(slot);
            }
        });
    };

    DFP.prototype.createSizeMapping = function(attr) {
        return attr.split('|').map(function(size) {
            return size.split(',').map(Number);
        });
    };

    DFP.prototype.defineSlotSizes = function(slot) {
        var self    = this,
            mapping = googletag.sizeMapping();

        for(var breakpoint in this.config.breakpoints) {
            var attr  = slot.getAttribute('data-'+ breakpoint),
                width = self.config.breakpoints[breakpoint];

            if(attr) {
                mapping.addSize([width, 0], self.createSizeMapping(attr));
            }
        }

        return mapping.build();
    };

    DFP.prototype.parseAd = function(e, level, message, service, slot) {
        var $slot = $('#'+ slot.getSlotId().getDomId());

        this.checkForBreakout($slot);
        this.addLabel($slot);
    };

    DFP.prototype.checkForBreakout = function($slot) {
        var frameContents = $slot[0].querySelector('iframe').contentDocument.body;

        for(var cls in breakoutHash) {
            var $el = bonzo(frameContents.querySelector('.'+ cls));

            if($el.length > 0) {
                $slot.html('');
                postscribe($slot[0], breakoutHash[cls].replace(/%content%/g, $el.html()));
            }
        }
    };

    DFP.prototype.addLabel = function($slot) {
        var $parent = $slot.parent();

        if($slot[0].style.display === 'none' || $parent.hasClass('ad-label--showing') || $parent.data('label') === false) {
            return false;
        }

        $parent.prepend('<div class="ad-slot__label">Advertisement</div>');
        $parent.addClass('ad-label--showing');
    };

    DFP.prototype.fireAdRequest = function() {
        googletag.pubads().enableSingleRequest();
        googletag.pubads().enableAsyncRendering();
        googletag.pubads().collapseEmptyDivs();
        googletag.enableServices();
        googletag.display(this.dfpAdSlots[0].querySelector(this.config.adContainerClass).id);
    };

    DFP.prototype.loadLibrary = function() {
        var gads   = document.createElement('script'),
            node   = document.getElementsByTagName('script')[0],
            useSSL = 'https:' === document.location.protocol;

        gads.async = true;
        gads.type  = 'text/javascript';
        gads.src   = (useSSL ? 'https:' : 'http:') + this.config.dfpUrl;

        node.parentNode.insertBefore(gads, node);
    };

    DFP.prototype.reload = function() {
        var adsToRefresh = this.adsToRefresh;

        googletag.pubads().refresh(adsToRefresh);
    };

    DFP.prototype.init = function() {
        this.dfpAdSlots = $('.ad-slot__dfp');

        if(this.dfpAdSlots.length === 0) {
            return false;
        }

        window.googletag = window.googletag || { cmd: [] };

        this.loadLibrary();

        try {
            googletag.cmd.push(DFPEvents.init);
            googletag.cmd.push(this.setListeners.bind(this));
            googletag.cmd.push(this.setPageTargetting.bind(this));
            googletag.cmd.push(this.defineSlots.bind(this));
            googletag.cmd.push(this.fireAdRequest.bind(this));
        } catch(e) {
            mediator.emit('module:error', 'DFP ad loading error: ' + e, 'common/modules/adverts/dfp.js');
        }
    };

    return DFP;

});
