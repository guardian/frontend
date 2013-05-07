define([
    'common'
], function (
    common
) {

    function Gallerystream(config) {

        var that = this,
            id = config.id,
            el = config.el,
            ophanUrl = config.ophanUrl,
            logCount = 0, // Average words
            START = new Date().getTime(),
            IMAGECOUNT = config.imageCount,
            VIEW_THRESHOLD = 80; // Ie. 80%
 
        this.imagesViewed = 0;

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

        this.logView = function() {
            this.imagesViewed++;
            if(this.percentageViewed() > VIEW_THRESHOLD) {
                this.log();
            }
        };

        this.galleryIsInViewport = function(el) {
          var rect = el.getBoundingClientRect();
            return rect.top < (window.innerHeight || document.body.clientHeight) && rect.left < (window.innerWidth || document.body.clientWidth);
        };

        this.timeOnPage = function() {
            return new Date().getTime() - START;
        };

        this.percentageViewed = function() {
            return Math.round(this.imagesViewed/(IMAGECOUNT/100));
        };

        this.log = function() {
           
            // Prevent multiple entries p/page
            if (logCount >= 1) {
                return false;
            }

            var data = {
                "prev-id" : id,
                "prev-timeOnPage"        : this.timeOnPage(),
                "prev-timeViewing"       : this.timer.time,
                "prev-imagesViewed"      : this.imagesViewed,
                "prev-totalImages"       : IMAGECOUNT,
                "prev-percentageViewed"  : this.percentageViewed()
            };

            logCount++;

            require([ophanUrl], function (Ophan) {
                Ophan.additionalClickData(data);
            });
        };

        this.bindings = function() {

            common.mediator.on('module:clickstream:interaction', function(str) {
                that.logView.call(that);
            });

            common.mediator.on('module:clickstream:click', function(clickSpec) {
                if (!clickSpec.samePage) {
                    that.log.call(that);
                }
            });

        };

        this.init = function() {
            this.bindings();

            // Check every second if page has scrolled
            var currentScroll = window.pageYOffset;
            setInterval(function() {
                //If scroll position has moved
                if (window.pageYOffset !== currentScroll) {
                    currentScroll = window.pageYOffset;
                    
                    //If the element is now in viewport and timer not started
                    if(that.galleryIsInViewport.call(that, el) && !that.timer.started) {
                        that.timer.start();
                    }
                }
            }, 1000);
        };
    }

    return Gallerystream;
});
