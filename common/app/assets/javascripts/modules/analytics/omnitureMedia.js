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

        var videoType = 'content',
            mediaName = config.page.webTitle,
            provider = config.page.source || '',
            restricted = config.page.blockVideoAds || '',
            playCount = 0;

        this.getDuration = function() {
            return videoEl.duration;
        };

        this.getPosition = function() {
            return videoEl.currentTime;
        };

        this.play = function() {

            if (playCount === 0) {
                if (this.getDuration() > 0) {

                    this.trackUserInteraction('Play', 'User clicked play', false);
                    if(videoEl.advertWasRequested) {
                        this.trackUserInteraction('Advert', 'Video advert was requested', false);
                    }

                    // We need to wait before calling s.Media.open; duration could be NaN.
                    s.Media.open(mediaName, this.getDuration(), 'HTML5 Video');
                    s.Media.play(mediaName, this.getPosition());
                    playCount++;
                } else {
                    setTimeout(this.play.bind(this), 100);
                }
            } else {
                s.Media.play(mediaName, this.getPosition());
                playCount++;
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
                default:
                    event = 'event14';
                    break;
            }
            s.prop41 = type;
            s.linkTrackVars = 'events,eVar11,prop41,eVar43,prop43,eVar44,prop44';
            s.linkTrackEvents = event;
            s.events = event;
            s.tl(true, 'o', name);
        };

        this.trackVideoAdvert = function() {
            videoType = 'advert';
            s.trackVideoAd();
        };

        this.trackVideoContent = function() {
            videoType = 'content';
            s.trackVideoContent(provider, restricted);
        };

        this.init = function() {
            s.loadMediaModule(provider, restricted);

            s.prop11 = config.page.sectionName || '';
            s.prop43 = 'Video';
            s.eVar11 = s.prop11;
            s.eVar43 = s.prop43;

            bean.on(videoEl, 'play', common.debounce(this.play.bind(this), 250));
            bean.on(videoEl, 'pause', this.pause.bind(this));
            bean.on(videoEl, 'seeking', this.seeking.bind(this));
            bean.on(videoEl, 'seeked', this.seeked.bind(this));
            bean.on(videoEl, 'volumechange', common.throttle(this.trackUserInteraction.bind(this, 'Volume', 'User Changed Volume'), 250));
            bean.on(videoEl, 'play:advert', this.trackVideoAdvert.bind(this));
            bean.on(videoEl, 'play:content', this.trackVideoContent.bind(this));
        };
    }
    return OmnitureMedia;
});
