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
            restricted = config.page.blockVideoAds || '';

        this.getDuration = function() {
            return player.duration();
        };

        this.getPosition = function() {
            return player.currentTime();
        };

        this.firstPlay = function() {
            if (!contentStarted) { // ensure we only open once
                s.Media.open(mediaName, this.getDuration(), 'HTML5 Video');
                contentStarted = true;
            }
        };

        this.play = function() {
            if (contentStarted) {
                s.Media.play(mediaName, this.getPosition());
            }
        };

        this.pause = function() {
            s.Media.stop(mediaName, this.getPosition());
        };

        this.buffer = function() {
            s.Media.stop(mediaName, this.getPosition());
        };

        this.seeking = function() {
            s.Media.stop(mediaName, this.getPosition());
        };

        this.seeked = function() {
            s.Media.play(mediaName, this.getPosition());
        };

        this.trackUserInteraction = function(type, name) {
            var event;
            switch(type){
                case 'Play':
                    event = 'event98';
                    break;
                case 'Advert':
                    event = 'event97';
                    break;
            }
            s.prop41 = type;
            s.linkTrackVars = 'events,eVar11,prop41,eVar43,prop43,eVar44,prop44';
            s.linkTrackEvents = event;
            s.events = event;
            s.tl(true, 'o', name);
        };

        this.trackVideoAdvertReady = function() {
            s.trackVideoAd();
            this.trackUserInteraction('Advert', 'Video advert is ready');
        };

        this.trackVideoContentReady = function() {
            s.trackVideoContent(provider, restricted);
            this.trackUserInteraction('Play', 'Video content is ready');
        };

        this.init = function() {
            s.loadMediaModule(provider, restricted);

            s.prop11 = config.page.sectionName || '';
            s.prop43 = 'Video';
            s.eVar11 = s.prop11;
            s.eVar43 = s.prop43;

            player.on('play', this.play.bind(this));
            player.on('pause', this.pause.bind(this));
            player.on('seeking', this.seeking.bind(this));
            player.on('seeked', this.seeked.bind(this));
            player.on('volumechange', throttle(this.trackUserInteraction.bind(this, 'Volume', 'User Changed Volume'), 250));

            player.on('video:preroll:ready', this.trackVideoAdvertReady.bind(this));
            player.on('video:content:ready', this.trackVideoContentReady.bind(this));
            player.on('video:preroll:play', this.firstPlay.bind(this));
            player.on('video:content:play', this.firstPlay.bind(this));
        };
    }
    return OmnitureMedia;
});
