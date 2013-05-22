define([
    "common",
    "bean"
], function(
    common,
    bean
    ) {

    function Video(options) {

        var self = this,
            config = options.config,
            video = options.el,
            videoType = "content",
            player = "HTML5 Video",
            mediaName = config.page.webTitle,
            provider = config.page.source || "",
            restricted = config.page.blockAds || "",
            deBounced,
            initialPlay =  {
                advert: true,
                content: true
            };

        this.getDuration = function() {
            return video.duration;
        };

        this.getPosition = function() {
            return video.currentTime;
        };

        this.play = function() {
            if (initialPlay.content === true && initialPlay.advert === true) {
                bean.one(video, 'loadedmetadata', function() {
                    if(video.advertWasRequested) {
                        self.trackUserInteraction("Advert", "Video advert was requested");
                    }
                   self.trackUserInteraction("Play", "User clicked play");
                });
            }

            if ((videoType === 'content' && initialPlay[videoType] === true) ||
                (videoType === 'advert' && initialPlay[videoType] === true)) {
                    // We need to wait for the metadata before calling
                    // s.Media.open, otherwise duration comes back as NaN
                    bean.one(video, 'loadedmetadata', function() {
                        s.Media.open(mediaName, self.getDuration(), player);
                        s.Media.play(mediaName, self.getPosition());
                    });

                    initialPlay[videoType] = false;
            } else {
                s.Media.play(mediaName, self.getPosition());
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
            clearTimeout(deBounced);
            deBounced = setTimeout(function(){
                var event;
                switch(type){
                    case "Play" :
                        event = "event98";
                        break;
                    case "Advert" :
                        event = "event97";
                        break;
                    default :
                        event = "event14";
                        break;
                }
                s.prop41 = type;
                s.linkTrackVars = "prop43,prop44,prop45,eVar43,eVar44,eVar45,prop41,events";
                s.linkTrackEvents = event;
                s.events = event;
                s.tl(true, "o", name);
            }, 250);
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
            var that = this;

            s.loadMediaModule(provider, restricted);

            s.prop43 = "Video";
            s.prop44 = config.page.analyticsName;
            s.prop45 = s.channel;

            s.eVar43 = s.prop43;
            s.eVar44 = s.prop44;
            s.eVar45 = s.prop45;

            bean.on(video, 'play', function(){ that.play(); });
            bean.on(video, 'pause', function() { that.pause(); });
            bean.on(video, 'seeking', function() { that.seeking(); });
            bean.on(video, 'seeked', function() {that.seeked(); });
            bean.on(video, 'volumechange', function() {that.trackUserInteraction("Volume", "User Changed Volume"); });

            bean.on(video, 'play:advert', function() { that.trackVideoAdvert(); });
            bean.on(video, 'play:content', function() { that.trackVideoContent(); });
        };
    }

    return Video;
});