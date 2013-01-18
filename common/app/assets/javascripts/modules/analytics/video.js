define([
        'bean'
    ],
    function (
        Bean
    ) {

    var Videostream = function(pageName) {

        var that = this,
            mediaName = pageName,
            playerName = 'HTML5',
            video = document.querySelector('#player video'),
            initialContentPlay = true,
            seekStamp =  0;

        this.getDuration = function() {
            return video.currentTime;
        };

        this.play = function() {
            if(initialContentPlay) {
                initialContentPlay = false;
                console.log('played');
                s.Media.open(mediaName, that.getDuration(), playerName);
            }
            s.Media.play(mediaName, that.getDuration());
        };

        this.stop = function() {
            console.log('stoped');
            s.Media.stop(mediaName, that.getDuration());
        };

        this.seeked = function() {
            var currentTime = this.getDuration();
            if(that.seekStamp+20000 < currentTime || that.seekStamp-20000 > currentTime) {
                console.log('seeked');
                s.Media.stop(mediaName, that.getDuration());
            }
            that.seekStamp = currentTime;
        };

        this.bindings = function() {
            Bean.on(video, 'play', this.play);
            Bean.on(video, 'pause stop', this.stop);

             // Check every second video has seeked
             // This is a hack because of poor cross browser
             // HTML5 video api "seeked" event implementation
            setInterval(function() {
                that.seeked.call(that);
            }, 1000);
        };

        this.init = function() {
            this.bindings();
        };

    };

    return Videostream;
});
