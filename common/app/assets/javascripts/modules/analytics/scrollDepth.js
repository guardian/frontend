define([
    'common/utils/mediator',
    'lodash/objects/assign'
], function (
    mediator,
    extend
) {

    function ScrollDepth(config) {
        this.config = extend(this.config, config);
        this.start = new Date().getTime();

        this.init();
    }

    ScrollDepth.prototype.config = {
        changeThreshold :10,
        isContent: false,
        contentEl: document.getElementById('article')
    };

    ScrollDepth.prototype.data = {
        pageDepth: 0,
        timeOnPage: 0,
        contentDepth: 0,
        timeOnContent: 0
    };

    ScrollDepth.prototype.timeSince = function(time) {
        return new Date().getTime() - time;
    };

    ScrollDepth.prototype.getPercentageInViewPort = function(el) {
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

    ScrollDepth.prototype.isInViewport = function(el) {
        var rect = el.getBoundingClientRect();
        return rect.top < (window.innerHeight || document.body.clientHeight) && rect.left < (window.innerWidth || document.body.clientWidth);
    };

    ScrollDepth.prototype.setData = function(currentDepth) {
        this.data.pageDepth = currentDepth;
        this.data.timeOnPage = this.timeSince(this.start);
        if(this.config.isContent && this.isInViewport(this.config.contentEl)) {
            if(this.data.timeOnContent === 0) {
                this.data.timeOnContent = new Date().getTime();
            }

            this.timeOnContent = this.timeSince(this.data.timeOnContent);
            this.contentDepth = this.getPercentageInViewPort(this.config.contentEl);
        }
    };

    ScrollDepth.prototype.hasDataChanged = function() {
        var currentDepth = this.getPercentageInViewPort(document.body);
        if((currentDepth - this.data.pageDepth) > this.config.changeThreshold) {
            this.setData(currentDepth);
            this.log();
        }
    };

    ScrollDepth.prototype.assertScrolling = function() {
        function timeout() {
            mediator.emit('scrolldepth:inactive');
        }
        if(typeof this.timeoutId === 'number') { window.clearTimeout(this.timeoutId); }
        this.timeoutId = window.setTimeout(timeout.bind(this), 2000);
    };

    ScrollDepth.prototype.log = function() {

    };

    ScrollDepth.prototype.init = function() {
        mediator.on('window:scroll', this.assertScrolling.bind(this));
        mediator.on('scrolldepth:inactive', this.hasDataChanged.bind(this));
        mediator.on('module:clickstream:click', this.log.bind(this));
    };

    return ScrollDepth;

});
