define([
    'bonzo',
    'common/utils/_',
    'common/utils/mediator',
    'fastdom'
], function (
    bonzo,
    _,
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
        this.read = null;
        this.write = null;
    };

    Sticky.prototype.init = function () {
        mediator.on('window:scroll', this.updatePosition.bind(this));
        // kick off an initial position update
        this.updatePosition();
    };

    Sticky.prototype.updatePosition = function () {
        var fixedTop, css;

        this.read && fastdom.clear(this.read);
        this.read = fastdom.read(function () {
            // have we scrolled past the element
            if (window.scrollY >= this.$parent.offset().top - this.opts.top) {
                // make sure the element stays within its parent
                fixedTop = Math.min(this.opts.top, this.$parent[0].getBoundingClientRect().bottom - this.$element.dim().height);

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

            this.write && fastdom.clear(this.write);
            this.write = fastdom.write(function () {
                this.$element.css(css);
            }.bind(this));
        }.bind(this));
    };

    return Sticky;
});
