define([
    "common",
    "bean"
], function(
   common,
   bean
    ) {

    function Video(config) {

        var support = config.support,
            video = config.el,
            loaded = false,
            url = "http://cdn5.unicornmedia.com/now/stitched/mp4/a2a102a4-334b-428c-801b-0049ba6f85ab/00000000-0000-0000-0000-000000000000/3a41c6e4-93a3-4108-8995-64ffca7b9106/224e7283-52f4-430e-9df2-f33f395a2065/0/0/21/-1305548010/unicorn.mp4",
            url2 = "https://s3-eu-west-1.amazonaws.com/aws-frontend-story-telling/ads/Countdown10to0.mp4";

        this.load = function(format) {
            var sources = video.querySelectorAll('source'),
                source;

            loaded = true;

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

            video.src = url2;
            video.play();
        };

        this.init = function() {
            var format = false,
                that = this;

            console.log(support);

            for (var f in support) {
                if(support.hasOwnProperty(f)) {
                    if(support[f] === "probably") {
                        format = f;
                        break;
                    }
                }
            }

            if(format) {
                bean.on(video, "play", function() {
                    if(!loaded) {
                        that.load(format);
                    }
                });
            }
        }

    }

    return Video;

});
