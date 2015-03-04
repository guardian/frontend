define([
    'bonzo',
    'fastdom',
    'lodash/functions/throttle',
    'lodash/objects/defaults',
    'common/utils/mediator'
], function (
    bonzo,
    fastdom,
    throttle,
    defaults,
    mediator
) {
    /**
     * @todo: check if browser natively supports "position: sticky"
     */
    var Sticky = function (element, options) {
        this.$element = bonzo(element);
        this.$parent  = this.$element.parent();
        this.opts     = defaults(options || {}, {
            top: 0
        });
    };

    Sticky.prototype.init = function () {
        mediator.on('window:scroll', throttle(this.updatePosition.bind(this), 10));
        // kick off an initial position update
        this.updatePosition();
    };

    Sticky.prototype.updatePosition = function () {
        var fixedTop, css, that = this;

        // have we scrolled past the element
        fastdom.read(function () {
            if (window.scrollY >= that.$parent.offset().top - that.opts.top) {
                // make sure the element stays within its parent
                fixedTop = Math.min(that.opts.top, that.$parent[0].getBoundingClientRect().bottom - that.$element.dim().height);

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
        });
    };

    return Sticky;
});
