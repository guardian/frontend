define([
    'lodash/functions/throttle',
    'common/utils/config'
], function(
    throttle,
    config
    ) {

    function OmnitureMedia(player) {

        var mediaName = config.page.webTitle,
            contentStarted = false,
            provider = config.page.source || '',
            restricted = config.page.blockVideoAds || '',
            continuousEventTimer,
            events = { // this is the expected ordering of events
                'video:request': '98',
                'preroll:request': '97',
                'preroll:play': '59',
                'preroll:end': '64',
                'video:play': '17',
                'video:25': '21',
                'video:50': '22',
                'video:75': '23',
                'video:end': '18'
            };

        this.getDuration = function() {
            return player.duration();
        };

        this.getPosition = function() {
            return player.currentTime();
        };

        this.play = function() {
            if (contentStarted) {
                this.startContinuousEventTimer();
            }
        };

        this.pause = function() {
            this.stopContinuousEventTimer();
        };

        this.seeking = function() {
            this.stopContinuousEventTimer();
        };

        this.sendEventName = function(eventName, ad) {
            var omnitureEvent = 'event' + events[eventName];
            this.sendEvent(omnitureEvent, eventName, ad);
        };

        this.sendEvent = function(event, eventName, ad) {
            s.eVar74 = ad ?  'video ad' : 'video content';
            if (eventName) {
                s.prop41 = eventName;
            }
            s.linkTrackVars = 'events,eVar11,prop41,eVar43,prop43,eVar44,prop44';
            s.linkTrackEvents = event;
            s.events = event;
            s.tl(true, 'o', eventName || event);
        };

        this.hitSegment = function(segment) {
            this.sendEventName('video:' + segment);
        };

        this.firstPlay = function() {
            this.sendEvent('video:request');
            this.sendEvent('preroll:request');
        };

        this.omnitureInit= function() {
            s.loadModule('Media');
            s.Media.autoTrack=false;
            s.Media.trackWhilePlaying = false;
            s.Media.trackVars='events,eVar7,eVar43,eVar44,prop44,eVar47,eVar48,eVar56,eVar61';
            s.Media.trackEvents='event17,event18,event21,event22,event23,event57,event63';
            s.Media.segmentByMilestones = false;
            s.Media.trackUsingContextData = false;

            s.eVar11 = s.prop11 = config.page.sectionName || '';
            s.eVar43 = s.prop43 = 'Video';
            s.eVar44 = s.prop44 = mediaName;
            s.eVar7 = s.pageName;
            s.eVar61 = restricted;
            s.eVar56 = provider;

            s.Media.open(mediaName, this.getDuration(), 'HTML5 Video');
        };

        this.startContinuousEventTimer = function() {
            this.stopContinuousEventTimer();
            var t = new Date();
            var sendContinuousEvent = function() {
                var n = new Date(),
                    delta = (n - t)  / 1000.0;
                t = n;
                this.sendEvent('event57=' + delta.toFixed(0));
            };
            continuousEventTimer = window.setInterval(sendContinuousEvent.bind(this), 10000);
        };

        this.stopContinuousEventTimer = function() {
            if (continuousEventTimer) {
                window.clearInterval(continuousEventTimer);
            }
            continuousEventTimer = false;
        };

        this.init = function() {
            var self = this;

            this.omnitureInit();

            player.one('play', this.firstPlay.bind(this));

            player.on('play', this.play.bind(this));
            player.on('pause', this.pause.bind(this));

            player.on('seeking', this.seeking.bind(this));

            player.one('video:preroll:play', this.sendEventName.bind(this, 'preroll:play', true));
            player.one('video:preroll:end', this.sendEventName.bind(this, 'preroll:end', true));

            player.one('video:content:play', function() {
                contentStarted = true;
                self.sendEventName('video:play');
                self.startContinuousEventTimer();
            });

            player.one('video:content:end', this.sendEventName.bind(this, 'video:end'));

            player.one('video:play:25', this.hitSegment.bind(this, 25));
            player.one('video:play:50', this.hitSegment.bind(this, 50));
            player.one('video:play:75', this.hitSegment.bind(this, 75));
        };
    }
    return OmnitureMedia;
});
