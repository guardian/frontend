define([
    'lodash/objects/values',
    'common/utils/config',
    'qwery'
], function(
    _values,
    config,
    qwery
    ) {

    function OmnitureMedia(player) {
        function getAttribute(attributeName) {
            return player.el().getAttribute(attributeName);
        }

        var mediaName = getAttribute('data-title') || config.page.webTitle,
            // infer type (audio/video) from what element we have
            mediaType = qwery('audio', player.el()).length ? 'audio' : 'video',
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
                'audio:play': 'event19',
                'video:25': 'event21',
                'video:50': 'event22',
                'video:75': 'event23',
                'video:end': 'event18',
                'audio:end': 'event20',
                // extra events with no set ordering
                'duration': 'event57',
                'segment': 'event63'
            },
            segments = ['0-25','25-50','50-75','75-100'],
            segmentEvents = ['event21', 'event22', 'event23', events[mediaType + ':end']];

        this.getDuration = function() {
            return parseInt(getAttribute('data-duration'), 10) || undefined;
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
            if (mediaType === 'video' && contentStarted) {
                this.startDurationEventTimer();
            }
        };

        this.pause = function() {
            if (mediaType === 'video') {
                this.stopDurationEventTimer();
            }
        };

        this.sendEvent = function(event, eventName, ad) {
            s.eVar74 = ad ?  mediaType + ' ad' : mediaType + ' content';
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
            s.Media.trackEvents='event17,event18,event19,event20,event21,event22,event23,event57,event59,event63,event64,event97,event98';
            s.Media.segmentByMilestones = false;
            s.Media.trackUsingContextData = false;

            s.eVar11 = s.prop11 = config.page.sectionName || '';
            s.eVar43 = s.prop43 = mediaType.charAt(0).toUpperCase() + mediaType.slice(1);
            s.eVar44 = s.prop44 = mediaName;
            s.eVar7 = s.pageName;
            s.eVar61 = restricted;
            s.eVar56 = provider;

            s.Media.open(mediaName, this.getDuration(), 'HTML5 Video');

            if (mediaType === 'video') {
                this.sendNamedEvent('video:request');
            }
        };

        var lastDurationEvent,
            durationEventTimer;

        this.getDurationWatched = function() { // get the duration watched since this function was last called
            var durationWatched = 0,
                now = new Date(),
                delta = (now - lastDurationEvent) / 1000.0;
            if (durationEventTimer && contentStarted && delta > 1) {
                durationWatched = Math.round(delta);
            }
            lastDurationEvent = now;
            return durationWatched;
        };

        this.baseDurationEvent = function() {
            var evts = [],
                durationWatched = this.getDurationWatched();
            if (durationWatched) {
                evts.push(events.duration + '=' + durationWatched);
            }
            return evts;
        };

        this.sendSegment = function(segment) {
            var evts = this.baseDurationEvent();
            evts.push(events.segment); // omniture segment completed event (uses eVar48 below)
            s.eVar48 = segment.omnitureName;
            evts.push(segment.event); // custom quartile completed event
            this.sendEvent(evts.join(','));
            s.eVar48 = undefined;
        };

        this.sendDurationEvent = function() {
            var evts = this.baseDurationEvent();
            s.eVar48 = this.getSegmentInfo().omnitureName;
            if (evts && evts.length > 0) {
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
            player.on('pause', this.pause.bind(this));

            player.one('video:preroll:request', this.sendNamedEvent.bind(this, 'preroll:request', true));
            player.one('video:preroll:play', this.sendNamedEvent.bind(this, 'preroll:play', true));
            player.one('video:preroll:end', this.sendNamedEvent.bind(this, 'preroll:end', true));
            player.one('video:content:play', function() {
                contentStarted = true;
                self.sendNamedEvent('video:play');
                self.startDurationEventTimer();
            });
            player.one('audio:content:play', this.sendNamedEvent.bind(this, 'audio:play'));

            player.one('video:play:25', this.sendSegment.bind(this, this.getSegmentInfo(0)));
            player.one('video:play:50', this.sendSegment.bind(this, this.getSegmentInfo(1)));
            player.one('video:play:75', this.sendSegment.bind(this, this.getSegmentInfo(2)));
            player.one('video:content:end', this.sendSegment.bind(this, this.getSegmentInfo(3)));
            player.one('audio:content:end', this.sendNamedEvent.bind(this, 'audio:end'));
        };
    }
    return OmnitureMedia;
});
