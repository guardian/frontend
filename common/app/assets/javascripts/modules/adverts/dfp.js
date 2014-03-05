/*global guardian, googletag */
define([
    'common/$',
    'bonzo',
    'postscribe',
    'common/modules/component',
    'lodash/objects/assign',
    'common/utils/cookies',
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
        breakpoints: {
            Article: {
                small: [200, 200],
                large: [900, 200]
            },
            Section: {
                small: [200, 200],
                large: [740, 200]
            }
        }
    };

    DFP.prototype.createSizeMapping = function() {
        var small = this.config.breakpoints[this.config.page.contentType].small,
            large = this.config.breakpoints[this.config.page.contentType].large;

        return googletag.sizeMapping().
            addSize(small, [300, 80]).
            addSize(large, [900, 250]).
            build();
    };

    DFP.prototype.setTargetting = function(conf) {
        var keywords         = conf.keywords    ? conf.keywords.split(',')       : '',
            section          = conf.section     ? conf.section.toLowerCase()     : '',
            contentType      = conf.contentType ? conf.contentType.toLowerCase() : '',
            audienceSegments = AudienceScience.getSegments()     || [],
            userSegments     = UserAdTargeting.getUserSegments() || [];

        // Add the adtest cookie to the keywords
        if(Cookies.get('adtest') === '18') {
            keywords.push('test18');
        }

        googletag.pubads().setTargeting('k', ['test18', 'speedo_sponser_test', 'eon_sponser_test'].concat(keywords));
        googletag.pubads().setTargeting('pt', contentType);
        googletag.pubads().setTargeting('ct', contentType);
        googletag.pubads().setTargeting('cat', section);
        googletag.pubads().setTargeting('a', audienceSegments);
        googletag.pubads().setTargeting('gdncrm', userSegments);
    };

    DFP.prototype.loadCommercialComponents = function() {
        var self = this,
            conf = this.config;

        var mapping = this.createSizeMapping();

        // Commercial component
        googletag.defineSlot('/'+ conf.accountId +'/'+ conf.server, [900, 250], 'dfp_commercial_component').addService(googletag.pubads());

        // Paid for logo
        googletag.defineSlot('/'+ conf.accountId +'/'+ conf.server, [300, 80], 'dfp_paidforlogo').addService(googletag.pubads());

        this.setTargetting(conf.page);

        googletag.pubads().enableSingleRequest();
        googletag.pubads().enableAsyncRendering();
        googletag.pubads().collapseEmptyDivs();
        googletag.enableServices();
        googletag.display('dfp_commercial_component');
    };

    DFP.prototype.setListeners = function() {
        googletag.on('gpt-slot_rendered', this.checkForBreakout);
    };

    DFP.prototype.checkForBreakout = function(e, level, message, service, slot, reference) {
        var $slot          = $('#'+ slot.getSlotId().getDomId()),
            $frameContents = $slot[0].querySelector('iframe').contentDocument.body;

        for(var cls in breakoutHash) {
            var $el = bonzo($frameContents.querySelector('.'+ cls));

            if($el.length > 0) {
                $slot.html('');
                postscribe($slot[0], breakoutHash[cls].replace(/%content%/g, $el.html()));
            }
        }
    };

    DFP.prototype.load = function() {
        if($('.ad-slot__dfp').length === 0) {
            return false;
        }

        window.googletag = window.googletag || { cmd: [] };

        googletag.cmd.push(this.setListeners.bind(this));
        googletag.cmd.push(this.loadCommercialComponents.bind(this));
    };

    return DFP;

});
