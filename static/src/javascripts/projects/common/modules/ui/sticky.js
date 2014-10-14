define([
    'bonzo',
    'common/utils/$',
    'common/utils/mediator'
], function (
    bonzo,
    $,
    mediator
) {

    var Sticky = function (element, top, options) {
        this.$element   = bonzo(element);
        this.top        = top;
        this.bottom     = options.bottom;
        // position of element from document top
        this.elementTop = element.getBoundingClientRect().top + window.scrollY;

        mediator.on('window:scroll-immediate', this.updatePosition.bind(this));
        // kick off an initial position update
        this.updatePosition();
    };

    Sticky.prototype.updatePosition = function () {
        if (window.scrollY >= this.elementTop) {
            // if there's a bottom param, limit how far the bottom of the element is from the top of the document
            var limit = this.bottom ? this.bottom - window.scrollY + this.$element.dim().height : this.top;
            this.css(this.$element, 'fixed', Math.min(this.top, limit));
        } else {
            this.css(this.$element, null, null);
        }
    };

    Sticky.prototype.css = function ($element, position, top) {
        return $element.css({
            position: position,
            top:      top
        });
    };

    return Sticky;

});
