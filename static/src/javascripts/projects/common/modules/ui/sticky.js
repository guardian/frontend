define([
    'bonzo',
    'lodash/functions/throttle',
    'common/utils/mediator'
], function (
    bonzo,
    throttle,
    mediator
) {

    /**
     * @todo: check if browser natively supports "position: sticky"
     */
    var Sticky = function (element, options) {
        this.element = element;
        this.top     = options.top || 0;
    };

    Sticky.prototype.init = function () {
        // position of element from document top
        this.elementDocOffset = this.element.getBoundingClientRect().top + window.scrollY;

        mediator.on('window:scroll', throttle(this.updatePosition.bind(this), 10));
        // kick off an initial position update
        this.updatePosition();
    };

    Sticky.prototype.updatePosition = function () {
        var parent, fixedTop, css,
            $element = bonzo(this.element);

        // have we scrolled past the element
        if (window.scrollY >= this.elementDocOffset - this.top) {
            parent = $element.parent()[0];
            // make sure the element stays within its parent
            fixedTop = Math.min(this.top, parent.getBoundingClientRect().bottom - $element.dim().height);

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

        return $element.css(css);
    };

    return Sticky;

});
