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
            mediaName = config.page.webTitle,
            provider = config.page.source || "",
            restricted = config.page.blockAds || "", 
            deBounced;

        this.getDuration = function() {
            return video.duration;
        };

        this.getPosition = function() {
            return video.currentTime;
        };

        this.play = function() {
            if (initialContentPlay) {
                initialContentPlay = false;
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
            clearTimeout(deBounced);
            deBounced = setTimeout(function(){
                var event = "event14";
                s.prop41 = type;
                s.linkTrackVars = "prop43,prop44,prop45,eVar43,eVar44,eVar45,prop41,events";
                s.linkTrackEvents = event;
                s.events = event;
                s.tl(true, "o", name);
            }, 250);
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
        };
    }

    return Video;
});