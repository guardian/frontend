define([
        'common',
        'bean',
        'modules/analytics/ophan'
    ],
    function (
        common,
        Bean,
        Ophan
    ) {

    var Videostream = function(config) {

        var that = this,
            id= config.id,
            video = config.el,
            logCount = 0,
            PATH = "/px.gif",
            START = new Date().getTime(),
            WATCH_THRESHOLD = 80; // Ie. 80%

        this.progress = 0;

        this.timer = {
            startTime: new Date().getTime(),
            time : 0,
            isPlaying: false,
            instance : function() {
                if(that.timer.isPlaying) {
                    that.timer.time += 100;
                    var diff = (new Date().getTime() - that.timer.startTime) - that.timer.time;
                    window.setTimeout(that.timer.instance, (100 - diff));
                }
            },
            start: function() {
                that.timer.isPlaying = true;
                window.setTimeout(that.timer.instance, 100);
            },
            stop: function() {
                that.timer.isPlaying = false;
            }
        };

        this.timeOnPage = function() {
            return new Date().getTime() - START;
        };
 
        this.getProgress = function() {
            return video.currentTime;
        };

        this.getDuration = function() {
            return video.duration;
        };

        this.play = function() {
            that.timer.start();
        };

        this.stop = function() {
            that.timer.stop();
        };

        this.logProgress = function(el) {
            var current = this.getProgress();
            this.progress = (current > this.progress) ? current : this.progress;
            if (this.progress > WATCH_THRESHOLD) {
                this.log();
            }
        };

        this.log = function() {
           
            // Prevent multiple entries p/page
            if (logCount >= 1) {
                return false;
            }

            var data = {
                "id" : id,
                "timeOnPage"            : this.timeOnPage(),
                "timeConsuming"         : this.timer.time,
                "duration"              : this.getDuration(),
                "durationConsumed"      : this.progress,
                "percentageConsumed"    : Math.round(this.progress/(this.getDuration()/100))
            };

            logCount++;

            Ophan.additionalClickData(data);
        };

        this.bindings = function() {
            Bean.on(video, 'play', this.play);
            Bean.on(video, 'pause stop', this.stop);

            common.mediator.on('module:clickstream:click', function(params) {
                var isSamePage = params[2];
                if (!isSamePage && params[0].nodeName.toLowerCase() === 'a') {
                    that.log.call(that);
                }
            });

            setInterval(function() {
                if(that.timer.isPlaying) {
                    that.logProgress.call(that);
                }
            }, 1000);
        };

        this.init = function() {
            this.bindings();
        };

    };

    return Videostream;
});
