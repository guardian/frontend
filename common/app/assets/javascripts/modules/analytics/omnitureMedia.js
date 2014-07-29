define([
    'lodash/functions/throttle',
    'lodash/objects/values',
    'common/utils/config'
], function(
    throttle,
    _values,
    config
    ) {

    function OmnitureMedia(player) {

        var mediaName = config.page.webTitle,
            contentStarted = false,
            provider = config.page.source || '',
            restricted = config.page.blockVideoAds || '',
            events = {
                // this is the expected ordering of events
                'video:request': 'event98',
                'preroll:request': 'event97',
                'preroll:play': 'event59',
                'preroll:end': 'event64',
                'video:play': 'event17',
                'video:25': 'event21',
                'video:50': 'event22',
                'video:75': 'event23',
                'video:end': 'event18',
                // extra events with no set ordering
                'duration': 'event57',
                'segment': 'event63'
            },
            segments = ['0-25','25-50','50-75','75-100'],
            segmentEvents = ['event21', 'event22', 'event23', 'event18'];

        this.getDuration = function() {
            return player.duration();
        };

        this.getPosition = function() {
            return player.currentTime();
        };

        this.getSegmentInfo = function(segmentIndex) {
            if (typeof segmentIndex !== 'number') {
                var progress = this.getPosition() / this.getDuration();
                segmentIndex = Math.floor(progress / 0.25);
            }
            return {
                event: segmentEvents[segmentIndex],
                omnitureName: segments[segmentIndex]
            };
        };

        this.play = function() {
            if (contentStarted) {
                this.startDurationEventTimer();
            }
        };

        this.sendEvent = function(event, eventName, ad) {
            s.eVar74 = ad ?  'video ad' : 'video content';
            s.prop41 = eventName;
            s.linkTrackVars = 'events,eVar11,prop41,eVar43,prop43,eVar44,prop44,eVar48';
            s.linkTrackEvents = _values(events).join(',');
            s.events = event;
            s.tl(true, 'o', eventName || event);
            s.prop41 = undefined;
        };

        this.sendNamedEvent = function(eventName, ad) {
            this.sendEvent(events[eventName], eventName, ad);
        };

        this.omnitureInit= function() {
            s.loadModule('Media');
            s.Media.autoTrack=false;
            s.Media.trackWhilePlaying = false;
            s.Media.trackVars='events,eVar7,eVar43,eVar44,prop44,eVar47,eVar48,eVar56,eVar61';
            s.Media.trackEvents='event17,event18,event21,event22,event23,event57,event59,event63,event64,event97,event98';
            s.Media.segmentByMilestones = false;
            s.Media.trackUsingContextData = false;

            s.eVar11 = s.prop11 = config.page.sectionName || '';
            s.eVar43 = s.prop43 = 'Video';
            s.eVar44 = s.prop44 = mediaName;
            s.eVar7 = s.pageName;
            s.eVar61 = restricted;
            s.eVar56 = provider;

            s.Media.open(mediaName, this.getDuration(), 'HTML5 Video');

            this.sendNamedEvent('video:request');
        };

        var lastDurationEvent,
            durationEventTimer;

        this.sendDurationEvent = function(completedSegment) {
            // this sends both duration and completed segment events simultaneously

            var evts = [];

            if (durationEventTimer) { // if duration timer is running then add the duration event
                var now = new Date(),
                    delta = (now - lastDurationEvent) / 1000.0,
                    deltaSeconds = Math.round(delta);
                lastDurationEvent = now;
                if (deltaSeconds > 2) { // stops event spam when seeking and pause/playing
                    evts.push(events.duration + '=' + deltaSeconds);
                }
            }

            if (completedSegment) { // if we completed a segment then add the segment completed events
                evts.push(events.segment); // omniture segment completed event (uses eVar48)
                s.eVar48 = completedSegment.omnitureName;
                evts.push(completedSegment.event); // custom quartile completed event
            } else { // track current segment if we didn't complete it
                s.eVar48 = this.getSegmentInfo().omnitureName;
            }

            if (evts) {
                this.sendEvent(evts.join(','));
            }

            s.eVar48 = undefined;
        };

        this.startDurationEventTimer = function() {
            this.stopDurationEventTimer();
            lastDurationEvent = new Date();
            durationEventTimer = window.setInterval(this.sendDurationEvent.bind(this), 10000);
        };

        this.stopDurationEventTimer = function() {
            this.sendDurationEvent(); // send any partial duration before stopping
            if (durationEventTimer) {
                window.clearInterval(durationEventTimer);
            }
            durationEventTimer = false;
        };

        this.init = function() {
            var self = this;

            this.omnitureInit();

            player.on('play', this.play.bind(this));
            player.on('pause', this.stopDurationEventTimer.bind(this));
            player.on('seeking', this.stopDurationEventTimer.bind(this));
            player.on('seeked', this.startDurationEventTimer.bind(this));

            player.one('adsready', this.sendNamedEvent.bind(this, 'preroll:request', true));
            player.one('video:preroll:play', this.sendNamedEvent.bind(this, 'preroll:play', true));
            player.one('video:preroll:end', this.sendNamedEvent.bind(this, 'preroll:end', true));
            player.one('video:content:play', function() {
                contentStarted = true;
                self.sendNamedEvent('video:play');
                self.startDurationEventTimer();
            });

            player.one('video:play:25', this.sendDurationEvent.bind(this, this.getSegmentInfo(0)));
            player.one('video:play:50', this.sendDurationEvent.bind(this, this.getSegmentInfo(1)));
            player.one('video:play:75', this.sendDurationEvent.bind(this, this.getSegmentInfo(2)));
            player.one('video:content:end', this.sendDurationEvent.bind(this, this.getSegmentInfo(3)));
        };
    }
    return OmnitureMedia;
});
