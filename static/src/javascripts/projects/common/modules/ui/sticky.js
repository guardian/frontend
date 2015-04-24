define([
    'bonzo',
    'common/utils/_',
    'common/utils/$',
    'common/utils/mediator',
    'common/modules/experiments/ab'
], function (
    bonzo,
    _,
    $,
    mediator,
    ab
) {

    function isMainTest() {
        var MtMainTest = ab.getParticipations().MtMain;

        return ab.testCanBeRun('MtMain') && MtMainTest && MtMainTest.variant === 'A';
    }

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
        mediator.on('window:scroll', _.throttle(this.updatePosition.bind(this), 10));
        // kick off an initial position update
        this.updatePosition();
    };

    Sticky.prototype.updatePosition = function () {
        var fixedTop, css, stickyHeaderHeight;

        stickyHeaderHeight = isMainTest() ? $('.navigation').dim().height : 0;

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

        return this.$element.css(css);
    };

    return Sticky;

});
