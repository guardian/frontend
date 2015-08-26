define([
    'bonzo',
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'fastdom'
], function (
    bonzo,
    _,
    $,
    config,
    mediator,
    fastdom
) {
    /**
     * @todo: check if browser natively supports "position: sticky"
     */
    var Sticky = function (element, options) {
        this.$element = bonzo(element);
        this.$parent  = this.$element.parent();
        this.opts     = _.defaults(options || {}, {
            top: 0
        });

        _.bindAll(this, 'updatePosition');
    };

    Sticky.prototype.init = function () {
        mediator.on('window:throttledScroll', this.updatePosition);
        // kick off an initial position update
        fastdom.read(this.updatePosition);
    };

    Sticky.prototype.updatePosition = function () {
        var fixedTop, css, stickyHeaderHeight, that = this;

        stickyHeaderHeight = config.switches.viewability ? $('.navigation').dim().height : 0;

        // have we scrolled past the element
        if (window.scrollY >= this.$parent.offset().top - this.opts.top - stickyHeaderHeight) {
            // make sure the element stays within its parent
            fixedTop = Math.min(this.opts.top, this.$parent[0].getBoundingClientRect().bottom - this.$element.dim().height) + stickyHeaderHeight;

            css = {
                position: 'fixed',
                top:      fixedTop
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
