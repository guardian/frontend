/*global guardian, googletag */
define([
    'common/$',
    'bonzo',
    'postscribe',
    'common/modules/component',
    'lodash/objects/assign',
    'common/utils/cookies',
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
    Cookies,
    mediator,
    AudienceScience,
    UserAdTargeting,
    DFPEvents
) {

    var breakoutHash = {
        'breakout__html': '%content%',
        'breakout__script': '<script>%content%</script>'
    };

    function DFP(config) {
        this.context = document;
        this.config = extend(this.config, config);
    }

    Component.define(DFP);

    DFP.prototype.config = {
        accountId: '158186692',
        server: 'test-theguardian.com',
        dfpUrl: '//www.googletagservices.com/tag/js/gpt.js'
    };

    DFP.prototype.setListeners = function() {
        googletag.on('gpt-slot_rendered', this.checkForBreakout);
    };

    DFP.prototype.setTargetting = function() {
        var conf             = this.config.page,
            keywords         = conf.keywords    ? conf.keywords.split(',')       : '',
            section          = conf.section     ? conf.section.toLowerCase()     : '',
            contentType      = conf.contentType ? conf.contentType.toLowerCase() : '';

        googletag.pubads().setTargeting('k', keywords);
        googletag.pubads().setTargeting('at', Cookies.get('adtest') || '');
        googletag.pubads().setTargeting('pt', contentType);
        googletag.pubads().setTargeting('ct', contentType);
        googletag.pubads().setTargeting('cat', section);
        googletag.pubads().setTargeting('a', AudienceScience.getSegments() || []);
        googletag.pubads().setTargeting('gdncrm', UserAdTargeting.getUserSegments() || []);
    };

    DFP.prototype.defineSlots = function() {
        var account = '/'+ this.config.accountId +'/'+ this.config.server;

        this.dfpAdSlots.each(function(adSlot) {
            var id    = adSlot.id,
                name  = adSlot.getAttribute('data-name'),
                sizes = adSlot.getAttribute('data-size').split(',').map(Number);

            googletag.defineSlot(account, sizes, id).addService(googletag.pubads()).setTargeting('slot', name);
        });
    };

    DFP.prototype.fireAdRequest = function() {
        googletag.pubads().enableSingleRequest();
        googletag.pubads().enableAsyncRendering();
        googletag.pubads().collapseEmptyDivs();
        googletag.enableServices();
        googletag.display(this.dfpAdSlots[0].id);
    };

    DFP.prototype.checkForBreakout = function(e, level, message, service, slot, reference) {
        var $slotEl       = $('#'+ slot.getSlotId().getDomId()),
            frameContents = $slotEl[0].querySelector('iframe').contentDocument.body;

        for(var cls in breakoutHash) {
            var $el = bonzo(frameContents.querySelector('.'+ cls));

            if($el.length > 0) {
                $slotEl.html('');
                postscribe($slotEl[0], breakoutHash[cls].replace(/%content%/g, $el.html()));
            }
        }
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

    DFP.prototype.destroy = function() {
        this.dfpAdSlots = [];
    };

    DFP.prototype.load = function() {
        this.dfpAdSlots = $('.ad-slot__dfp');

        if(this.dfpAdSlots.length === 0) {
            return false;
        }

        window.googletag = window.googletag || { cmd: [] };

        this.loadLibrary();

        try {
            googletag.cmd.push(DFPEvents.init);
            googletag.cmd.push(this.setListeners.bind(this));
            googletag.cmd.push(this.setTargetting.bind(this));
            googletag.cmd.push(this.defineSlots.bind(this));
            googletag.cmd.push(this.fireAdRequest.bind(this));
        } catch(e) {
            mediator.emit('module:error', 'DFP ad loading error: ' + e, 'common/modules/adverts/dfp.js');
        }
    };

    return DFP;

});
