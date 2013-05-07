define([
    'common'
], function (
    common
) {

    /**
     * Readable constructor
     * @param {Object} config Global config options hash
     */
    function Readable(config) {

        var that = this,
            el = config.el,
            id = config.id,
            ophanUrl = config.ophanUrl,
            PATH = "/px.gif",
            START = new Date().getTime(),
            WORDCOUNT = config.wordCount,
            WPM = 200,
            READ_THRESHOLD = 80, // Ie. 80%
            logCount = 0; // Average words
 
        this.viewportPercentage = 0;

        this.timer = {
            startTime: new Date().getTime(),
            time : 0,
            started: false,
            instance : function() {
                that.timer.time += 100;
                var diff = (new Date().getTime() - that.timer.startTime) - that.timer.time;
                window.setTimeout(that.timer.instance, (100 - diff));
            },
            start: function() {
                window.setTimeout(that.timer.instance, 100);
                that.timer.started = true;
            }
        };

        this.getPercentageInViewPort = function(el) {
            var rect = el.getBoundingClientRect(),
                height = (window.innerHeight || document.body.clientHeight);

            if(rect.bottom < 0 || rect.bottom < height) {
                return 100;
            } else if(rect.top > height) {
                return 0;
            } else if(rect.top > 0) {
                return (100/rect.height)*(height - rect.top);
            } else {
                return (100/rect.height)*(Math.abs(rect.top) + height);
            }
        };

        this.logElementPosition = function(el) {
            var current = parseInt(this.getPercentageInViewPort(el), 10);
            this.viewportPercentage = (current > this.viewportPercentage) ? current : this.viewportPercentage;
            if (this.viewportPercentage > READ_THRESHOLD) {
                this.log();
            }
        };

        this.articleIsInViewport = function(el) {
          var rect = el.getBoundingClientRect();
            return rect.top < (window.innerHeight || document.body.clientHeight) && rect.left < (window.innerWidth || document.body.clientWidth);
        };

        this.timeOnPage = function() {
            return new Date().getTime() - START;
        };

        this.wordsRead = function() {
            var elapsedWords = Math.round((WPM/60000)*this.timer.time);
            return (elapsedWords > WORDCOUNT) ? WORDCOUNT : elapsedWords;
        };

        this.percentageRead = function() {
            return Math.round(this.wordsRead()/(WORDCOUNT/100));
        };

        this.log = function() {
           
            // Prevent multiple entries p/page
            if (logCount >= 1) {
                return false;
            }

            var data = {
                "prev-id" : id,
                "prev-timeOnPage"        : this.timeOnPage(),
                "prev-timeReading"       : this.timer.time,
                "prev-wordsRead"         : this.wordsRead(),
                "prev-wordCount"         : WORDCOUNT,
                "prev-percentageRead"    : this.percentageRead(),
                "prev-percentageViewport": this.viewportPercentage
            };

            logCount++;

            require([ophanUrl], function (Ophan) {
                Ophan.additionalClickData(data);
            });
        };

        common.mediator.on('module:clickstream:click', function(clickSpec) {
            if (!clickSpec.samePage) {
                that.log.call(that);
            }
        });

        this.init = function() {
            // Check every second if page has scrolled
            var currentScroll = window.pageYOffset;
            setInterval(function() {
                //If scroll position has moved
                if (window.pageYOffset !== currentScroll) {
                    currentScroll = window.pageYOffset;
                    
                    //If the element is now in viewport and timer not started
                    if(that.articleIsInViewport.call(that, el) && !that.timer.started) {
                        that.timer.start();
                    }

                    that.logElementPosition(el);
                }
            }, 1000);
        };
    }

    return Readable;
});
