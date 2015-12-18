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
    /**
     * @todo: check if browser natively supports "position: sticky"
     */
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
        var css, that = this;

        //stickyHeaderHeight = config.switches.viewability ? $('.navigation').dim().height : 0;
        // have we scrolled past the element
        if (window.scrollY >= this.$parent.offset().top - this.opts.top) {
            css = {
                position: 'fixed',
                top: this.opts.top
            };
        } else {
            css = {
                position: null,
                top:      null
            };
        }

        fastdom.write(function () {
            that.$element.css(css);
        });
    };

    return Sticky;

});
