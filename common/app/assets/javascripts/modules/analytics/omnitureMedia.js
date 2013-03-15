define([
    "bean"
], function(
    bean
    ) {

    function Video(options) {

        var config = options.config,
            video = options.el,
            initialContentPlay = true,
            player = "HTML5 Video",
            mediaName = config.page.webTitle;

        this.getDuration = function() {
            return video.duration;
        };

        this.getPosition = function() {
            return video.currentTime;
        };

        this.play = function() {
            //TODO: put provider and restricted in page metaData
            var provider = "ITN", restricted = false;

            if (initialContentPlay) {
                initialContentPlay = false;
                s.loadMediaModule(provider, restricted);
                s.Media.open(mediaName, this.getDuration(), player);
            }

            s.Media.play(mediaName, this.getPosition());
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
            var event = "event14";
            s.prop41 = type;
            s.linkTrackVars = "prop43,prop44,prop45,eVar43,eVar44,eVar45,prop41,events";
            s.linkTrackEvents = event;
            s.events = event;
            s.tl(true, "o", name);
        };

        this.init = function() {
            var that = this;

            s.prop43 = "Video";
            s.prop44 = config.page.analyticsName;
            s.prop45 = s.channel;

            s.eVar43 = s.prop43;
            s.eVar44 = s.prop44;
            s.eVar45 = s.prop45;

            s.events = "event68";

            bean.on(video, 'play', function(){ that.play(); });
            bean.on(video, 'stop', function() { that.stop(); });
            bean.on(video, 'seeking', function() { that.seeking(); });
            bean.on(video, 'seeked', function() {that.seeked(); });

        };
    }

    return Video;
});