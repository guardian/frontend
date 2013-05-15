define([
    "common",
    "bean"
], function(
   common,
   bean
) {

    function Video(config) {
        this.config = config.config;
        this.context = config.context;
        this.support = config.support;
        this.video = config.el;
        this.played = false;
        this.timer = false;
        this.events = {};
    }

    function VideoEvent(url) {
        this.url = url;
        this.hasFired = false;
    }

    Video.prototype.play = function(format, data) {
        var self = this,
            sources = this.video.querySelectorAll('source'),
            source;

        this.played = true;

        //Horrible UA detection for iOS
        if(format === "mp4") {
            if(window.navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
                format = "m3u8";
            }
        }

        for(var i = 0, l = sources.length; i < l; i++) {
            if(sources[i].src.search("."+format) > -1) {
                source = sources[i].src;
                break;
            }
        }

        bean.on(this.video, "ended error", function() {
            //Init omniture tracking
            common.mediator.emit("video:ads:finished", self.config, self.context);

            bean.off(self.video, "ended error");
            if(self.events.clickThrough) { bean.off(self.video, "click"); }

            bean.fire(self.video, "play:content");
            self.video.src = source;
            self.video.play();

            common.$g(self.video).removeClass("has-cursor");

            if(self.events.complete && !self.events.complete.hasFired) {
                self.logEvent(self.events.complete);
                clearInterval(self.timer);
            }
        });

        // Prevent different size ads from making the video jump around
        this.video.style.height = this.video.offsetHeight+'px';

        bean.fire(this.video, "play:advert");
        this.video.src = data.file;
        this.video.play();

        if(data.trackingEvents) {
            this.initTracking(data.trackingEvents);
        }
    };

    Video.prototype.initTracking = function(tracking) {
        var self = this;

        for(var event in tracking) {
           this.events[event] = new VideoEvent(tracking[event]);
        }

        if(this.events.impression) { this.logEvent(this.events.impression); }
        if(this.events.oasImpression) { this.logEvent(this.events.oasImpression); }
        if(this.events.start) { this.logEvent(this.events.start); }
        if(this.events.clickThrough) {
            common.$g(this.video).addClass("has-cursor");
            bean.on(self.video, "click touchstart", function(){
                bean.off(self.video, "click touchstart");
                self.logEvent(self.events.oasClickThrough);
                window.open(self.events.clickThrough.url);
            });
        }

       this.timer = setInterval(function() {
           var progress = self.getProgress(),
               duration = self.getDuration();

           if(progress > (duration/2) && !self.events.midpoint.hasFired) {
               self.logEvent(self.events.midpoint);
           }
       }, 1000);
    };

    Video.prototype.getProgress = function() {
        return this.video.currentTime;
    };

    Video.prototype.getDuration = function() {
        return this.video.duration;
    };

    Video.prototype.logEvent = function(event) {
        var px = new Image();
        px.src = event.url; px.width = 0; px.height = 0;
        document.body.appendChild(px);
        event.hasFired = true;
    };

    Video.prototype.init = function(advert) {
        var format = false,
            that = this;

        for (var f in this.support) {
            if(this.support.hasOwnProperty(f)) {
                if(this.support[f] === "probably") {
                    format = f;
                    break;
                }
            }
        }

        //We are only supporting mp4 adverts first
        if(format === "mp4") {
            bean.on(that.video, "play", function() {
                if(!that.played) {
                    that.play(format, advert);
                }
            });
        } else {
            common.mediator.emit("video:ads:finished", that.config, that.context);
        }
    };

    return Video;

});
