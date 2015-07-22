define([
    'bean',
    'bonzo',
    'common/utils/_',
    'common/utils/mediator',
    'fastdom'
], function (
    bean,
    bonzo,
    _,
    mediator,
    fastdom
) {

    var Affix = function (options) {

        bean.on(window, 'click', this.checkPositionWithEventLoop.bind(this));
        mediator.addListener('window:throttledScroll', _.debounce(this.checkPositionWithEventLoop.bind(this), 10));
        mediator.addListener('window:resize', _.debounce(this.calculateContainerPositioning.bind(this), 200));

        this.affixed  = null;
        this.$markerTop = bonzo(options.topMarker);
        this.$markerBottom = bonzo(options.bottomMarker);
        this.$container = bonzo(options.containerElement);
        this.$element = bonzo(options.element);
        this.$window = bonzo(document.body);

        this.calculateContainerPositioning();
    };

    Affix.CLASS = 'affix';
    Affix.CLASSY_BOTTOM = 'affix-bottom';

    Affix.prototype.calculateContainerPositioning = function () {

        // The container defines the static positioning of the affix element.
        this.$container.css('top', '0');
        var containerTop = this.$markerTop.offset().top - this.$container.offset().top;
        this.$container.css('top', containerTop + 'px');
    };

    Affix.prototype.checkPositionWithEventLoop = function (scrollY) {
        fastdom.read(this.checkPosition.bind(this, scrollY));
    };

    Affix.prototype.getPixels = function (top) {
        return top !== 'auto' ? parseInt(top, 10) : 0;
    };

    Affix.prototype.checkPosition = function (scrollY) {
        var oldContainerStyling, topStyle,
            topCheck      = scrollY >= this.$markerTop.offset().top,
            bottomCheck   = scrollY + this.$element.dim().height < this.$markerBottom.offset().top,
            viewportCheck = this.$element.dim().height < bonzo.viewport().height,
            // This is true when the element is positioned below the top threshold and above the bottom threshold.
            affix         = bottomCheck && topCheck && viewportCheck;

        if (this.affixed !== affix) {
            this.affixed = affix;

            // Lock the affix container to the bottom marker.
            if (bottomCheck) {
                this.$container.removeClass(Affix.CLASSY_BOTTOM);
                this.calculateContainerPositioning();
            } else {
                // Store the container top, which needs to be re-applied when affixed to bottom.
                oldContainerStyling = this.getPixels(this.$container.css('top'));
                topStyle            = this.$markerBottom.offset().top - this.$markerTop.offset().top - this.$element.dim().height + oldContainerStyling;
                this.$container.css('top',  topStyle + 'px');
                this.$container.addClass(Affix.CLASSY_BOTTOM);
            }

            if (affix) {
                this.$element.addClass(Affix.CLASS);
            } else {
                this.$element.removeClass(Affix.CLASS);
            }
        }
    };
    return Affix;
});
