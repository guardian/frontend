/* global guardian, s */
define([
    'qwery',
    'common/utils/config',
    'common/modules/analytics/omniture',
    'lodash/objects/values',
    'common/utils/chain'
], function (qwery, config, omniture, values, chain) {

    function OmnitureMedia(player, mediaId) {

        function getAttribute(attributeName) {
            return player.el().getAttribute(attributeName);
        }

        /*
         * prop71 tracks referring section.  It's kept in cookie 's_prev_ch'.
         * Page load event sets the cookie value to the current section, so this sets it back again.
         * It's safe for the next page load though.
         */
        function resetProp71Cookie() {
            if (config.isHosted) {
                s.getPreviousValue(s.prop71, 's_prev_ch');
            }
        }

        var pageId = config.page.pageId,
            // infer type (audio/video) from what element we have
            mediaType = qwery('audio', player.el()).length ? 'audio' : 'video',
            prerollPlayed = false,
            isEmbed = !!guardian.isEmbed,
            events = {
                // this is the expected ordering of events
                'video:play': 'event17',
                'preroll:request': 'event97',
                'preroll:play': 'event59',
                'preroll:skip': 'event99',
                'preroll:end': 'event64',
                'audio:play': 'event19',
                'video:25': 'event21',
                'video:50': 'event22',
                'video:75': 'event23',
                'video:end': 'event18',
                'audio:end': 'event20',
                'video:fullscreen': 'event96'
            },
            trackingVars = [
                // these tracking vars are specific to media events.
                'eVar11',   // embedded or on platform
                'prop41',   // preroll milestone
                'prop43',   // media type
                'prop44',   // page id
                'eVar44',   // page id
                'eVar74',   // ad or content
                'eVar61',   // restricted
                'prop39'    // media id
            ];

        if (config.isHosted) {
            trackingVars.push('prop71');    // previous site section
        }

        this.getDuration = function () {
            return parseInt(getAttribute('data-duration'), 10) || undefined;
        };

        this.getPosition = function () {
            return player.currentTime();
        };

        this.sendEvent = function (event, eventName, ad) {

            resetProp71Cookie();

            omniture.populateEventProperties(eventName || event);
            s.eVar74 = ad ?  mediaType + ' ad' : mediaType + ' content';

            // Set these each time because they are shared global variables, but OmnitureMedia is instanced.
            s.eVar43 = s.prop43 = mediaType.charAt(0).toUpperCase() + mediaType.slice(1);
            s.eVar44 = s.prop44 = pageId;
            s.prop39 = mediaId;

            if (prerollPlayed) {
                // Any event after 'video:preroll:play' should be tagged with this value.
                s.prop41 = 'PrerollMilestone';
            }
            s.linkTrackVars += ',' + chain(trackingVars).join(',');
            s.linkTrackEvents +=  ',' + values(events).join(',');
            s.events += ',' + event;
            s.tl(true, 'o', eventName || event);
            s.prop41 = s.eVar44 = s.prop44 = s.eVar43 = s.prop43 = s.eVar74 = undefined;
        };

        this.sendNamedEvent = function (eventName, ad) {
            this.sendEvent(events[eventName], eventName, ad);
        };

        this.omnitureInit = function () {

            resetProp71Cookie();

            s.loadModule('Media');
            s.Media.autoTrack = false;
            s.Media.trackWhilePlaying = false;
            s.Media.trackVars = omniture.getStandardProps() + ',' + chain(trackingVars).join(',');
            s.Media.trackEvents = values(events).join(',');
            s.Media.segmentByMilestones = false;
            s.Media.trackUsingContextData = false;

            s.eVar11 = isEmbed ? 'Embedded' : config.page.sectionName || '';
            s.eVar7 = s.pageName;

            s.Media.open(pageId, this.getDuration(), 'HTML5 Video');
        };

        this.onContentPlay = function () {
            this.sendNamedEvent('video:play');
        };

        this.onPrerollPlay = function () {
            prerollPlayed = true;
            this.sendNamedEvent('preroll:play', true);
        };

        this.init = function () {

            this.omnitureInit();

            player.one('video:preroll:request', this.sendNamedEvent.bind(this, 'preroll:request', true));
            player.one('video:preroll:play', this.onPrerollPlay.bind(this));
            player.one('video:preroll:skip', this.sendNamedEvent.bind(this, 'preroll:skip', true));
            player.one('video:preroll:end', this.sendNamedEvent.bind(this, 'preroll:end', true));
            player.one('video:content:play', this.onContentPlay.bind(this));
            player.one('audio:content:play', this.sendNamedEvent.bind(this, 'audio:play'));

            player.one('video:content:25', this.sendNamedEvent.bind(this, 'video:25'));
            player.one('video:content:50', this.sendNamedEvent.bind(this, 'video:50'));
            player.one('video:content:75', this.sendNamedEvent.bind(this, 'video:75'));
            player.one('video:content:end', this.sendNamedEvent.bind(this, 'video:end'));
            player.one('audio:content:end', this.sendNamedEvent.bind(this, 'audio:end'));
            player.on('player:fullscreen', this.sendNamedEvent.bind(this, 'video:fullscreen'));
        };
    }
    return OmnitureMedia;
});
