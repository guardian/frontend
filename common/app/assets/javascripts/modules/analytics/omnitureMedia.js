define([
    "common/common",
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
            restricted = config.page.blockVideoAds || "",
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
                self.execWhenDuration(function() {
                   self.trackUserInteraction("Play", "User clicked play", false);
                       if(video.advertWasRequested) {
                           self.trackUserInteraction("Advert", "Video advert was requested", false);
                       }
                });
            }

            if ((videoType === 'content' && initialPlay[videoType] === true) ||
                (videoType === 'advert' && initialPlay[videoType] === true)) {
                    // We need to wait for the metadata before calling
                    // s.Media.open, otherwise duration comes back as NaN
                    self.execWhenDuration(function() {
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

        this.trackUserInteraction = function(type, name, debounce, callback) {
           clearTimeout(deBounced);
           var log = function(){
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
            };

            if(debounce) {
                deBounced = setTimeout(log, 250);
            } else {
                log();
            }
        };

        this.trackVideoAdvert = function() {
            videoType = 'advert';
            s.trackVideoAd();
        };

        this.trackVideoContent = function() {
            videoType = 'content';
            s.trackVideoContent(provider, restricted);
        };

        this.execWhenDuration = function(callback) {
            var duration = this.getDuration();
            if(duration > 0) {
                callback();
            } else {
                setTimeout(function() {
                    self.execWhenDuration(callback);
                }, 100);
            }
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

            var play = common.debounce(that.play, 250);

            bean.on(video, 'play', play);

            bean.on(video, 'pause', function() { that.pause(); });
            bean.on(video, 'seeking', function() { that.seeking(); });
            bean.on(video, 'seeked', function() {that.seeked(); });
            bean.on(video, 'volumechange', function() {that.trackUserInteraction("Volume", "User Changed Volume", true); });

            bean.on(video, 'play:advert', function() { that.trackVideoAdvert(); });
            bean.on(video, 'play:content', function() { that.trackVideoContent(); });
        };
    }

    return Video;
});