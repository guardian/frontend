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
        // have we scrolled past the element
        if (window.scrollY >= this.elementDocOffset - this.top) {
            var elementTop = this.container ?
                // make sure the element stays within the container
                Math.min(this.top, this.container.getBoundingClientRect().bottom - bonzo(this.element).dim().height) :
                this.top;

            this.css(this.element, 'fixed', elementTop);
        } else {
            this.css(this.element, null, null);
        }
    };

    Sticky.prototype.css = function (element, position, top) {
        return bonzo(element).css({
            position: position,
            top:      top
        });
    };

    return Sticky;

});
