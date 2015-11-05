define([
    'common/utils/_',
    'common/utils/mediator',
    'lodash/objects/assign',
    'lodash/functions/bindAll',
    'lodash/functions/debounce'
], function (
    _,
    mediator,
    assign,
    bindAll,
    debounce) {

    function ScrollDepth(options) {
        this.opts = assign(this.opts, options);

        bindAll(this, 'assertScrolling', 'hasDataChanged');

        if (this.opts.isContent) {
            this.opts.contentEl = this.contentEl || document.getElementById('article') || document.getElementById('live-blog');
        }

        this.init();
    }

    ScrollDepth.prototype.opts = {
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

    ScrollDepth.prototype.timeSince = function (time) {
        return new Date().getTime() - time;
    };

    ScrollDepth.prototype.getPercentageInViewPort = function (el) {
        var rect = el.getBoundingClientRect(),
            height = (window.innerHeight || document.body.clientHeight);

        if (rect.bottom < 0 || rect.bottom < height) {
            return 100;
        } else if (rect.top > height) {
            return 0;
        } else if (rect.top > 0) {
            return (100 / (rect.height || 1)) * (height - rect.top);
        } else {
            return (100 / (rect.height || 1)) * (Math.abs(rect.top) + height);
        }
    };

    ScrollDepth.prototype.isInViewport = function (el) {
        var rect = el.getBoundingClientRect();
        return rect.top < (window.innerHeight || document.body.clientHeight) && rect.left < (window.innerWidth || document.body.clientWidth);
    };

    ScrollDepth.prototype.setData = function (type) {
        var currentDepth,
            el = this.opts[type + 'El'];
        if (!el) {
            return false;
        }
        currentDepth = this.getPercentageInViewPort(el);
        if ((currentDepth - this.data[type].depth) > this.opts.changeThreshold) {
            this.data[type].depth = currentDepth;
            if (typeof this.data[type].duration === 'number') {
                this.data[type].duration = this.timeSince(this.data[type].start);
            }
            return true;
        } else {
            return false;
        }
    };

    ScrollDepth.prototype.hasDataChanged = function () {
        var page = this.setData('page'),
            content = (this.opts.isContent) ? this.setData('content') : false;
        if (page || content) {
            this.log();
        }
    };

    ScrollDepth.prototype.assertScrolling = function () {
        function timeout() {
            mediator.emit('scrolldepth:inactive');
        }
        if (typeof this.timeoutId === 'number') { window.clearTimeout(this.timeoutId); }
        this.timeoutId = window.setTimeout(timeout.bind(this), 1000);
    };

    ScrollDepth.prototype.log = function () {
        mediator.emit('scrolldepth:data', this.data);
    };

    ScrollDepth.prototype.init = function () {
        mediator.on('window:throttledScroll', debounce(this.assertScrolling, 200));
        mediator.on('scrolldepth:inactive', this.hasDataChanged);
        mediator.on('module:clickstream:click', this.hasDataChanged);
    };

    return ScrollDepth;

});
