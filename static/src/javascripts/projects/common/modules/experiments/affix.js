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

        bean.on(window, 'click', this.checkPosition.bind(this));
        mediator.addListener('window:scroll', _.debounce(this.checkPosition.bind(this), 10));
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
        var _this = this;
        fastdom.write(function () {
            _this.$container.css('top', '0');
            fastdom.read(function () {
                var containerTop = _this.$markerTop.offset().top - _this.$container.offset().top;
                fastdom.write(function () {
                    _this.$container.css('top', containerTop + 'px');
                });
            });
        });
    };

    Affix.prototype.getPixels = function (top) {
        return top !== 'auto' ? parseInt(top, 10) : 0;
    };

    Affix.prototype.checkPosition = function () {
        var _this = this;
        fastdom.read(function () {
            var oldContainerStyling, topStyle,

                scrollTop     = _this.$window.scrollTop(),
                markerTopTop  = _this.$markerTop.offset().top,
                markerBottomTop = _this.$markerBottom.offset().top,
                elHeight      = _this.$element.dim().height,

                topCheck      = scrollTop >= markerTopTop,
                bottomCheck   = scrollTop + elHeight < markerBottomTop,
                viewportCheck = elHeight < bonzo.viewport().height,

                // This is true when the element is positioned below the top threshold and above the bottom threshold.
                affix         = bottomCheck && topCheck && viewportCheck;

            if (_this.affixed !== affix) {
                _this.affixed = affix;

                // Lock the affix container to the bottom marker.
                if (bottomCheck) {
                    fastdom.write(function () {
                        _this.$container.removeClass(Affix.CLASSY_BOTTOM);
                        _this.calculateContainerPositioning();
                    });
                } else {
                    // Store the container top, which needs to be re-applied when affixed to bottom.
                    oldContainerStyling = _this.getPixels(_this.$container.css('top'));
                    topStyle            = markerBottomTop - markerTopTop - elHeight + oldContainerStyling;
                    fastdom.write(function () {
                        _this.$container.css('top',  topStyle + 'px');
                        _this.$container.addClass(Affix.CLASSY_BOTTOM);
                    });
                }

                fastdom.write(function () {
                    if (affix) {
                        _this.$element.addClass(Affix.CLASS);
                    } else {
                        _this.$element.removeClass(Affix.CLASS);
                    }
                });
            }
        });
    };
    return Affix;
});
