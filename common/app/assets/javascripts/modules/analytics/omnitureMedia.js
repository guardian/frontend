define([
    'common/common',
    'common/utils/config',
    'bean'
], function(
    common,
    config,
    bean
    ) {

    function OmnitureMedia(videoEl) {

        var mediaName = config.page.webTitle,
            provider = config.page.source || '',
            restricted = config.page.blockVideoAds || '';

        this.getDuration = function() {
            return videoEl.duration;
        };

        this.getPosition = function() {
            return videoEl.currentTime;
        };

        this.play = function() {
            s.Media.open(mediaName, this.getDuration(), 'HTML5 Video');
            s.Media.play(mediaName, this.getPosition());
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

            bean.on(videoEl, 'pause', this.pause.bind(this));
            bean.on(videoEl, 'seeking', this.seeking.bind(this));
            bean.on(videoEl, 'seeked', this.seeked.bind(this));
            bean.on(videoEl, 'volumechange', common.throttle(this.trackUserInteraction.bind(this, 'Volume', 'User Changed Volume'), 250));

            bean.on(videoEl, 'video:preroll:ready', this.trackVideoAdvertReady.bind(this));
            bean.on(videoEl, 'video:content:ready', this.trackVideoContentReady.bind(this));
            bean.on(videoEl, 'video:preroll:play video:content:play', this.play.bind(this));
        };
    }
    return OmnitureMedia;
});
