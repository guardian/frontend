define([
    'common/utils/mediator',
    'lodash/objects/assign'
], function (
    mediator,
    extend
) {

    function ScrollDepth(config) {
        this.config = extend(this.config, config);

        if(this.config.isContent) {
            this.config.contentEl = this.contentEl || document.getElementById('article');
        }

        this.init();
    }

    ScrollDepth.prototype.config = {
        changeThreshold: 10,
        isContent: false,
        pageEl: document.body
    };

    ScrollDepth.prototype.data = {
        page: {
            start: new Date().getTime(),
            depth: 0,
            duration: 0
        },
        content: {
            depth: 0
        }
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
            return (100/(rect.height || 1))*(height - rect.top);
        } else {
            return (100/(rect.height || 1))*(Math.abs(rect.top) + height);
        }
    };

    ScrollDepth.prototype.isInViewport = function(el) {
        var rect = el.getBoundingClientRect();
        return rect.top < (window.innerHeight || document.body.clientHeight) && rect.left < (window.innerWidth || document.body.clientWidth);
    };

    ScrollDepth.prototype.setData = function(type) {
        var currentDepth = this.getPercentageInViewPort(this.config[type + 'El']);
        if((currentDepth - this.data[type].depth) > this.config.changeThreshold) {
            this.data[type].depth = currentDepth;
            if(typeof this.data[type].duration === 'number') {
                this.data[type].duration = this.timeSince(this.data[type].start);
            }
            return true;
        } else {
            return false;
        }
    };

    ScrollDepth.prototype.hasDataChanged = function() {
        var page = this.setData('page'),
            content = (this.config.isContent) ? this.setData('content') : false;
        if(page || content) {
            this.log();
        }
    };

    ScrollDepth.prototype.assertScrolling = function() {
        function timeout() {
            mediator.emit('scrolldepth:inactive');
        }
        if(typeof this.timeoutId === 'number') { window.clearTimeout(this.timeoutId); }
        this.timeoutId = window.setTimeout(timeout.bind(this), 1000);
    };

    ScrollDepth.prototype.log = function() {
        mediator.emit('scrolldepth:data', this.data);
    };

    ScrollDepth.prototype.init = function() {
        mediator.on('window:scroll', this.assertScrolling.bind(this));
        mediator.on('scrolldepth:inactive', this.hasDataChanged.bind(this));
        mediator.on('module:clickstream:click', this.hasDataChanged.bind(this));
    };

    return ScrollDepth;

});
