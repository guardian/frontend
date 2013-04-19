define([
    "common",
    "bean",
    "ajax"
], function(
   common,
   bean,
   ajax
) {

    function Video(config) {
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

    Video.prototype.url = "/video/ad/";

    Video.prototype.load = function(format) {
        var self = this;
        ajax({
            url: this.url + format,
            type: "jsonp",
            jsonpCallbackName: "advert",
            success : function (resp) {
                if(resp && resp.file) {
                    self.play(format, resp);
                }
            }
        });
    };

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
            bean.off(self.video, "ended error");
            self.video.src = source;
            self.video.play();
            common.$g(this.video).removeClass("hascursor");
            if(self.events.complete && !self.events.complete.hasFired) {
                self.logEvent(self.events.complete);
                clearInterval(self.timer);
            }
        });

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
        if(this.events.start) { this.logEvent(this.events.start); }
        if(this.events.clickThrough) {
            common.$g(this.video).addClass("has-cursor");
            bean.on(self.video, "click touchstart", function(){
                bean.off(self.video, "click touchstart");
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

    Video.prototype.init = function() {
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

        if(format) {
            common.mediator.on("module:video:adverts:load", function(file) {
                bean.on(that.video, "play", function() {
                    if(!that.played) {
                        that.play(format, file);
                    }
                });
            });
            this.load(format);
        }
    };

    return Video;

});
