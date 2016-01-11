define([
    'bonzo',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'fastdom',
    'lodash/objects/defaults',
    'lodash/functions/bindAll'
], function (
    bonzo,
    $,
    config,
    mediator,
    fastdom,
    defaults,
    bindAll) {

    var Sticky = function (element, options) {
        this.$element = bonzo(element);
        this.$parent  = bonzo(this.$element.parent()[0]);
        this.opts     = defaults(options || {}, {
            top: 0
        });

        bindAll(this, 'updatePosition');
    };

    Sticky.prototype.init = function () {
        mediator.on('window:throttledScroll', this.updatePosition);
        // kick off an initial position update
        fastdom.read(this.updatePosition);
    };

    Sticky.prototype.updatePosition = function () {
        var css, that = this, message;

        if (window.scrollY >= this.$parent.offset().top - this.opts.top) {
            css = {
                position: 'fixed',
                top: this.opts.top
            };
            message = 'fixed';
        } else {
            css = {
                position: null,
                top:      null
            };
            message = 'unfixed';
        }

        if(this.opts.emit && this.lastMessage && message !== this.lastMessage) {
            this.emitMessage(message);
        }
        this.lastMessage = message;

        fastdom.write(function () {
            that.$element.css(css);
        });
    };

    Sticky.prototype.emitMessage = function (message) {
        mediator.emit('modules:' + this.$element.attr('id') + ':' + message);
    };

    return Sticky;

});
