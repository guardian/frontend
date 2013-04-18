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
    }

    function VideoEvent(name, url) {
        this.name = name;
        this.url = url;
        this.hasFired = false;
    }

    Video.prototype.proxy = "/oas/";
    Video.prototype.url = "/2/m.guardiantest.co.uk/self-hosted/1234567890@x40";

    Video.prototype.load = function(format) {
        var self = this;
        ajax({
            url: this.proxy + format + this.url,
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
        });

        this.video.src = data.file;
        this.video.play();

        if(data.tracking) {
            this.initTracking(data.tracking);
        }
    };

    Video.prototype.initTracking = function(tracking) {
       var events = [];
       for(var event in tracking) {
           events.push(new VideoEvent(event, tracking[event]));
       }
    };

    Video.prototype.getProgress = function() {
        return this.video.currentTime;
    };

    Video.prototype.getDuration = function() {
        return this.video.duration;
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
