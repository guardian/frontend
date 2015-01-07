define([
    'bonzo',
    'lodash/functions/throttle',
    'lodash/objects/defaults',
    'common/utils/mediator'
], function (
    bonzo,
    throttle,
    defaults,
    mediator
) {

    /**
     * @todo: check if browser natively supports "position: sticky"
     */
    var Sticky = function (element, options) {
        this.element  = element;
        this.$element = bonzo(element);
        this.opts     = defaults(options || {}, {
            top: 0
        });
    };

    Sticky.prototype.init = function () {
        // position of element from document top
        this.elementDocOffset = this.element.getBoundingClientRect().top + window.scrollY;

        mediator.on('window:scroll', throttle(this.updatePosition.bind(this), 10));
        // kick off an initial position update
        this.updatePosition();
    };

    Sticky.prototype.updatePosition = function () {
        var parent, fixedTop, css;

        // have we scrolled past the element
        if (window.scrollY >= this.elementDocOffset - this.opts.top) {
            parent = this.$element.parent()[0];
            // make sure the element stays within its parent
            fixedTop = Math.min(this.opts.top, parent.getBoundingClientRect().bottom - this.$element.dim().height);

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
