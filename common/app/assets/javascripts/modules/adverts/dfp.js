/*global guardian, googletag */
define([
    'common/$',
    'qwery',
    'postscribe',
    'common/modules/component',
    'lodash/objects/assign',
    'common/modules/adverts/userAdTargeting',
    'common/modules/analytics/commercial/tags/common/audience-science'
], function (
    $,
    qwery,
    postscribe,
    Component,
    extend,
    userAdTargeting,
    audienceScience
) {

    var dfpUrl = 'js!'+ (document.location.protocol === 'https:' ? 'https' : 'http') +'://www.googletagservices.com/tag/js/gpt.js';

    function DFP(config) {
        this.context = document;
        this.config = extend(this.config, config);
    }

    Component.define(DFP);

    DFP.prototype.config = {
        accountId: '158186692',
        sizes: [[900, 250], [300, 80]],
        server: 'test-theguardian.com',
        adSlotId: 'dfp_commercial_component',
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
            audienceSegments = audienceScience.getSegments()     || [],
            userSegments     = userAdTargeting.getUserSegments() || [];

        googletag.pubads().setTargeting('k', ['test18', 'speedo_sponser_test', 'eon_sponser_test'].concat(keywords));
        // googletag.pubads().setTargeting('pt', contentType);
        // googletag.pubads().setTargeting('ct', contentType);
        // googletag.pubads().setTargeting('cat', section);
        // googletag.pubads().setTargeting('a', audienceSegments);
        // googletag.pubads().setTargeting('gdncrm', userSegments);
    };

    DFP.prototype.downloadGoogleLibrary = function(cb) {
        require([dfpUrl], cb || function() {});
    };

    DFP.prototype.loadCommercialComponents = function() {
        var self = this,
            conf = this.config;

        var mapping = this.createSizeMapping();

        googletag.defineSlot('/'+ conf.accountId +'/'+ conf.server, conf.sizes, conf.adSlotId).defineSizeMapping(mapping).addService(googletag.pubads());

        this.setTargetting(conf.page);

        googletag.pubads().enableSingleRequest();
        googletag.pubads().enableAsyncRendering();
        googletag.pubads().collapseEmptyDivs();
        googletag.enableServices();
        googletag.display(conf.adSlotId);
    };

    DFP.prototype.load = function() {
        if($('.ad-slot__dfp').length === 0) {
            return false;
        }

        window.googletag = window.googletag || { cmd: [] };

        this.downloadGoogleLibrary(function() {

            googletag.cmd.push(this.initLogging);

            googletag.cmd.push(function() {
                googletag.on('gpt-slot_rendered', function(e, level, message, service, slot, reference) {
                    var $slot         = $('#'+ slot.getSlotId().getDomId()),
                        frameContents = $slot[0].querySelector('iframe').contentDocument.body;

                    if(frameContents.querySelector('.breakout') !== null) {
                        $slot[0].innerHTML = '';
                        postscribe($slot[0], '<script>'+ frameContents.querySelector('.breakout').innerHTML +'</script>');
                    }
                });
            });

            googletag.cmd.push(this.loadCommercialComponents.bind(this));
        }.bind(this));
    };

    DFP.prototype.initLogging = function() {
        if(googletag.hasOwnProperty('on') || googletag.hasOwnProperty('off') || googletag.hasOwnProperty('trigger') || googletag.hasOwnProperty('events')) {
            return;
        }

        var events  = [],
            old_log = googletag.debug_log.log;

        function addEvent(name, id, match) {
            events.push({
                'name': name,
                'id': id,
                'match': match
            });
        }

        addEvent('gpt-google_js_loaded',                    8,  /Google service JS loaded/ig);
        addEvent('gpt-gpt_fetch',                           46, /Fetching GPT implementation/ig);
        addEvent('gpt-gpt_fetched',                         48, /GPT implementation fetched\./ig);
        addEvent('gpt-page_load_complete',                  1,  /Page load complete/ig);
        addEvent('gpt-queue_start',                         31, /^Invoked queued function/ig);
        addEvent('gpt-service_add_slot',                    40, /Associated ([\w]*) service with slot ([\/\w]*)/ig);
        addEvent('gpt-service_add_targeting',               88, /Setting targeting attribute ([\w]*) with value ([\w\W]*) for service ([\w]*)/ig);
        addEvent('gpt-service_collapse_containers_enable',  78, /Enabling collapsing of containers when there is no ad content/ig);
        addEvent('gpt-service_create',                      35, /Created service: ([\w]*)/ig);
        addEvent('gpt-service_single_request_mode_enable',  63, /Using single request mode to fetch ads/ig);
        addEvent('gpt-slot_create',                         2,  /Created slot: ([\/\w]*)/ig);
        addEvent('gpt-slot_add_targeting',                  17, /Setting targeting attribute ([\w]*) with value ([\w\W]*) for slot ([\/\w]*)/ig);
        addEvent('gpt-slot_fill',                           50, /Calling fillslot/ig);
        addEvent('gpt-slot_fetch',                          3,  /Fetching ad for slot ([\/\w]*)/ig);
        addEvent('gpt-slot_receiving',                      4,  /Receiving ad for slot ([\/\w]*)/ig);
        addEvent('gpt-slot_render_delay',                   53, /Delaying rendering of ad slot ([\/\w]*) pending loading of the GPT implementation/ig);
        addEvent('gpt-slot_rendering',                      5,  /^Rendering ad for slot ([\/\w]*)/ig);
        addEvent('gpt-slot_rendered',                       6,  /Completed rendering ad for slot ([\/\w]*)/ig);

        googletag.events = googletag.events || {};

        googletag.on = function(events, op_arg0, op_arg1){
            if(!op_arg0) {
                return this;
            }

            events = events.split(' ');

            var data     = op_arg1 ?  op_arg0 : undefined,
                callback = op_arg1 || op_arg0,
                ei       = 0,
                e        = '';

            callback.data = data;

            for(e = events[ei = 0]; ei < events.length; e = events[++ei]) {
                (this.events[e] = this.events[e] || []).push(callback);
            }

            return this;
        };


        googletag.off = function(events, handler) {
            events = events.split(' ');

            var ei = 0,
                fi = 0,
                e  = '',
                f  = function() {};

            for(e = events[ei]; ei < events.length; e = events[++ei]) {
                if(!this.events.hasOwnProperty(e)) {
                    continue;
                }

                if(!handler){
                    delete this.events[e];
                    continue;
                }

                fi = this.events[e].length - 1;

                for(f = this.events[e][fi]; fi >= 0; f = this.events[e][--fi]) {
                    if(f === handler) {
                        this.events[e].splice(fi,1);
                    }
                }

                if(this.events[e].length === 0) {
                    delete this.events[e];
                }
            }

            return this;
        };


        googletag.trigger = function(event, parameters){

            if(!this.events[event] || this.events[event].length === 0) {
                return this;
            }

            var fi = 0,f = this.events[event][fi];

            parameters = parameters || [];

            for(fi,f; fi < this.events[event].length; f = this.events[event][++fi]) {
                if(f.apply(this, [{data:f.data}].concat(parameters)) === false) {
                    break;
                }
            }

            return this;
        };


        googletag.debug_log.log = function(level, message, service, slot, reference) {

            if (message && message.getMessageId && typeof (message.getMessageId()) === 'number') {
                var e    = 0,
                    args = Array.prototype.slice.call(arguments);

                for(e; e < events.length; e++) {
                    if(events[e].id === message.getMessageId()) {
                        googletag.trigger(events[e].name, args);
                    }
                }
            }

            return old_log.apply(this,arguments);
        };
    };

    return DFP;

});
