define([
    'bean',
    'bonzo',
    'common/utils/_',
    'common/utils/mediator',
    'fastdom',
    'lodash/functions/bindAll',
    'lodash/functions/debounce'
], function (
    bean,
    bonzo,
    _,
    mediator,
    fastdom,
    bindAll,
    debounce) {

    var Affix = function (options) {

        bindAll(this, 'checkPosition', 'calculateContainerPositioning');

        bean.on(window, 'click', this.checkPosition);
        mediator.addListener('window:throttledScroll', this.checkPosition);
        mediator.addListener('window:resize', debounce(function () {
            fastdom.write(this.calculateContainerPositioning);
        }, 200));

        this.affixed  = null;
        this.$markerTop = bonzo(options.topMarker);
        this.$markerBottom = bonzo(options.bottomMarker);
        this.$container = bonzo(options.containerElement);
        this.$element = bonzo(options.element);
        this.$window = bonzo(document.body);

        fastdom.write(this.calculateContainerPositioning);
    };

    Affix.CLASS = 'affix';
    Affix.CLASSY_BOTTOM = 'affix-bottom';

    Affix.prototype.calculateContainerPositioning = function () {
        // The container defines the static positioning of the affix element.
        var that = this;

        // aleady called from inside a fastdom.write cb...
        this.$container.css('top', '0');
        fastdom.read(function () {
            var containerTop = that.$markerTop.offset().top - that.$container.offset().top;
            fastdom.write(function () {
                that.$container.css('top', containerTop + 'px');
            });
        });
    };

    Affix.prototype.getPixels = function (top) {
        return top !== 'auto' ? parseInt(top, 10) : 0;
    };

    Affix.prototype.checkPosition = function () {
        var that = this;
        var oldContainerStyling, topStyle,

            scrollTop     = this.$window.scrollTop(),
            markerTopTop  = this.$markerTop.offset().top,
            markerBottomTop = this.$markerBottom.offset().top,
            elHeight      = this.$element.dim().height,

            topCheck      = scrollTop >= markerTopTop,
            bottomCheck   = scrollTop + elHeight < markerBottomTop,
            viewportCheck = elHeight < bonzo.viewport().height,

            // This is true when the element is positioned below the top threshold and above the bottom threshold.
            affix         = bottomCheck && topCheck && viewportCheck;

        if (this.affixed !== affix) {
            this.affixed = affix;

            // Lock the affix container to the bottom marker.
            if (bottomCheck) {
                fastdom.write(function () {
                    that.$container.removeClass(Affix.CLASSY_BOTTOM);
                    that.calculateContainerPositioning();
                });
            } else {
                // Store the container top, which needs to be re-applied when affixed to bottom.
                oldContainerStyling = this.getPixels(this.$container.css('top'));
                topStyle            = markerBottomTop - markerTopTop - elHeight + oldContainerStyling;
                fastdom.write(function () {
                    that.$container.css('top',  topStyle + 'px');
                    that.$container.addClass(Affix.CLASSY_BOTTOM);
                });
            }

            fastdom.write(function () {
                if (affix) {
                    that.$element.addClass(Affix.CLASS);
                } else {
                    that.$element.removeClass(Affix.CLASS);
                }
            });
        }
    };
    return Affix;
});
