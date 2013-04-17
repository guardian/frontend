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

    Video.prototype.proxy = "/oas/";
    Video.prototype.url = "/2/m.guardiantest.co.uk/self-hosted/1234567890@x40";

    Video.prototype.load = function(format) {
        ajax({
            url: this.proxy + format + this.url,
            type: "jsonp",
            jsonpCallbackName: "advert",
            success : function (resp) {
                if(resp && resp.file) {
                    common.mediator.emit("module:video:adverts:load", resp.file);
                }
            }
        });
    };

    Video.prototype.play = function(format, file) {
        var sources = this.video.querySelectorAll('source'),
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
            bean.off(this.video, "ended error");
            this.video.src = source;
            this.video.play();
        });

        this.video.src = file;
        this.video.play();
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
                bean.on(this.video, "play", function() {
                    if(!this.played) {
                        that.play(format, file);
                    }
                });
            });
            this.load(format);
        }
    };

    return Video;

});
