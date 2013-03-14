define([
    "bean"
], function(
    bean
    ) {

    function Video(options) {

        var config = options.config,
            video = options.el,
            initialContentPlay = false,
            player = "HTML5 Video";

        this.getDuration = function() {
            return video.duration;
        };

        this.getPosition = function() {
            return video.currentTime;
        };

        this.play = function() {
            if (initialContentPlay) {
                initialContentPlay = false;
                s.Media.open(config.page.analyticsName, this.getDuration(), player);
            } else {
                s.Media.play(config.page.analyticsName, this.getPosition());
            }
        };

        this.init = function {
            var that = this;
            bean.on(video, 'play', function() {
                that.play();
            });
        };
    }

    return Video;
});