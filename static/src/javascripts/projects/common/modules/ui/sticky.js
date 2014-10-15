define([
    'bonzo',
    'lodash/functions/throttle',
    'common/utils/mediator'
], function (
    bonzo,
    throttle,
    mediator
) {

    var Sticky = function (element, options) {
        this.element          = element;
        this.top              = options.top || 0;
        this.container        = options.container;
        // position of element from document top
        this.elementDocOffset = this.element.getBoundingClientRect().top + window.scrollY;

        mediator.on('window:scroll-immediate', throttle(this.updatePosition.bind(this), 10));
        // kick off an initial position update
        this.updatePosition();
    };

    Sticky.prototype.updatePosition = function () {
        var css,
            $element = bonzo(this.element);
        // have we scrolled past the element
        if (window.scrollY >= this.elementDocOffset - this.top) {
            var elementTop = this.container ?
                // make sure the element stays within the container
                Math.min(this.top, this.container.getBoundingClientRect().bottom - $element.dim().height) :
                this.top;

            css = {
                position: fixed,
                top:      elementTop
            };
        } else {
            css = {
                position: null,
                top:      null
            };
        }
        return $element.css();
    };

    return Sticky;

});
