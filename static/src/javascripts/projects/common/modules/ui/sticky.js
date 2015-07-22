define([
    'bonzo',
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator'
], function (
    bonzo,
    _,
    $,
    config,
    mediator
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
    };

    Sticky.prototype.init = function () {
        mediator.on('window:throttledScroll', this.updatePosition.bind(this));
        // kick off an initial position update
        this.updatePosition();
    };

    Sticky.prototype.updatePosition = function (scrollY) {
        var fixedTop, css, stickyHeaderHeight;

        stickyHeaderHeight = config.switches.viewability ? $('.navigation').dim().height : 0;

        // have we scrolled past the element
        if (scrollY >= this.$parent.offset().top - this.opts.top - stickyHeaderHeight) {
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

        return this.$element.css(css);
    };

    return Sticky;

});
