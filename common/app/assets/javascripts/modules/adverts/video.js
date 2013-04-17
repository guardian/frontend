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

        var support = config.support,
            video = config.el,
            played = false,
            proxy = "/oas/",
            url = "/2/m.guardiantest.co.uk/self-hosted/1234567890@x40";

        this.load = function(format) {
            ajax({
                url: proxy + format + url,
                type: "json",
                method: 'get',
                success : function (resp) {
                    if(resp && resp.file) {
                        common.mediator.emit("module:video:adverts:load", resp.file);
                    }
                }
            });
        };

        this.play = function(format, file) {
            var sources = video.querySelectorAll('source'),
                source;

            played = true;

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

            bean.on(video, "ended error", function() {
                bean.off(video, "ended error");
                video.src = source;
                video.play();
            });

            video.src = file;
            video.play();
        };

        this.init = function() {
            var format = false,
                that = this;

            for (var f in support) {
                if(support.hasOwnProperty(f)) {
                    if(support[f] === "probably") {
                        format = f;
                        break;
                    }
                }
            }

            if(format) {
                common.mediator.on("module:video:adverts:load", function(file) {
                    bean.on(video, "play", function() {
                        if(!played) {
                            that.play(format, file);
                        }
                    });
                });
                this.load(format);
            }
        };

    }

    return Video;

});
