define([
    'qwery',
    'common/utils/mediator',
    'lodash/objects/assign'
], function (
    qwery,
    mediator,
    extend
) {

    function ScrollDepth(config) {
        this.config = extend(this.config, config);
        this.START = new Date().getTime();
        this.init();
    }

    ScrollDepth.prototype.config = {
        changeThreshold :10,
        isArticle: false,
        contentEl: qwery('#article')
    };
    ScrollDepth.prototype.pageDepth = 0;
    ScrollDepth.prototype.contentDepth = 0;

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

    ScrollDepth.prototype.hasDataChanged = function() {
        var currentDepth = this.getPercentageInViewPort(document.body);
        if((currentDepth - this.pageDepth) > this.config.changeThreshold) {
            this.pageDepth = currentDepth;
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
        return {
            pageDepth : this.pageDepth
        };
    };

    ScrollDepth.prototype.init = function() {
        mediator.on('window:scroll', this.assertScrolling.bind(this));
        mediator.on('scrolldepth:inactive', this.hasDataChanged.bind(this));
    };


    return ScrollDepth;

});
