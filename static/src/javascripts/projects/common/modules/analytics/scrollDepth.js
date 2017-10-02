import mediator from 'lib/mediator';
import assign from 'lodash/objects/assign';
import bindAll from 'lodash/functions/bindAll';
import debounce from 'lodash/functions/debounce';

class ScrollDepth {
    constructor(options) {
        this.opts = assign(this.opts, options);

        bindAll(this, 'assertScrolling', 'hasDataChanged');

        if (this.opts.isContent) {
            this.opts.contentEl = this.contentEl || document.getElementById('article') || document.getElementById('live-blog');
        }

        this.init();
    }

    timeSince(time) {
        return new Date().getTime() - time;
    }

    getPercentageInViewPort(el) {
        const rect = el.getBoundingClientRect(), height = (window.innerHeight || document.body.clientHeight);

        if (rect.bottom < 0 || rect.bottom < height) {
            return 100;
        } else if (rect.top > height) {
            return 0;
        } else if (rect.top > 0) {
            return (100 / (rect.height || 1)) * (height - rect.top);
        } else {
            return (100 / (rect.height || 1)) * (Math.abs(rect.top) + height);
        }
    }

    isInViewport(el) {
        const rect = el.getBoundingClientRect();
        return rect.top < (window.innerHeight || document.body.clientHeight) && rect.left < (window.innerWidth || document.body.clientWidth);
    }

    setData(type) {
        let currentDepth;
        const el = this.opts[type + 'El'];
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
    }

    hasDataChanged() {
        const page = this.setData('page'), content = (this.opts.isContent) ? this.setData('content') : false;
        if (page || content) {
            this.log();
        }
    }

    assertScrolling() {
        function timeout() {
            mediator.emit('scrolldepth:inactive');
        }
        if (typeof this.timeoutId === 'number') {
            window.clearTimeout(this.timeoutId);
        }
        this.timeoutId = window.setTimeout(timeout.bind(this), 1000);
    }

    log() {
        mediator.emit('scrolldepth:data', this.data);
    }

    init() {
        mediator.on('window:throttledScroll', debounce(this.assertScrolling, 200));
        mediator.on('scrolldepth:inactive', this.hasDataChanged);
        mediator.on('module:clickstream:click', this.hasDataChanged);
    }
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

export default ScrollDepth;
