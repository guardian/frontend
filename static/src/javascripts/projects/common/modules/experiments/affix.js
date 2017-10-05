import bean from 'bean';
import bonzo from 'bonzo';
import mediator from 'lib/mediator';
import fastdom from 'fastdom';
import bindAll from 'lodash/functions/bindAll';

class Affix {
    constructor(options) {
        bindAll(this, 'checkPosition', 'calculateContainerPositioning');

        bean.on(window, 'click', this.checkPosition);
        mediator.addListener('window:throttledScroll', this.checkPosition);
        mediator.addListener('window:throttledResize', function() {
            fastdom.write(this.calculateContainerPositioning);
        });

        this.affixed = null;
        this.$markerTop = bonzo(options.topMarker);
        this.$markerBottom = bonzo(options.bottomMarker);
        this.$container = bonzo(options.containerElement);
        this.$element = bonzo(options.element);
        this.$window = bonzo(document.body);

        this.checkPosition();

        fastdom.write(this.calculateContainerPositioning);
    }

    calculateContainerPositioning() {
        // The container defines the static positioning of the affix element.
        const that = this;

        // aleady called from inside a fastdom.write cb...
        this.$container.css('top', '0');
        fastdom.read(() => {
            const containerTop = that.$markerTop.offset().top - that.$container.offset().top;
            fastdom.write(() => {
                that.$container.css('top', containerTop + 'px');
            });
        });
    }

    getPixels(top) {
        return top !== 'auto' ? parseInt(top, 10) : 0;
    }

    checkPosition() {
        const that = this;
        let oldContainerStyling;
        let topStyle;
        const scrollTop = this.$window.scrollTop();
        const markerTopTop = this.$markerTop.offset().top;
        const markerBottomTop = this.$markerBottom.offset().top;
        const elHeight = this.$element.dim().height;
        const topCheck = scrollTop >= markerTopTop;
        const bottomCheck = scrollTop + elHeight < markerBottomTop;
        const viewportCheck = elHeight < bonzo.viewport().height;

        const // This is true when the element is positioned below the top threshold and above the bottom threshold.
        affix = bottomCheck && topCheck && viewportCheck;

        if (this.affixed !== affix) {
            this.affixed = affix;

            // Lock the affix container to the bottom marker.
            if (bottomCheck) {
                fastdom.write(() => {
                    that.$container.removeClass(Affix.CLASSY_BOTTOM);
                    that.calculateContainerPositioning();
                });
            } else {
                // Store the container top, which needs to be re-applied when affixed to bottom.
                oldContainerStyling = this.getPixels(this.$container.css('top'));
                topStyle = markerBottomTop - markerTopTop - elHeight + oldContainerStyling;
                fastdom.write(() => {
                    that.$container.css('top', topStyle + 'px');
                    that.$container.addClass(Affix.CLASSY_BOTTOM);
                });
            }

            fastdom.write(() => {
                if (affix) {
                    that.$element.addClass(Affix.CLASS);
                } else {
                    that.$element.removeClass(Affix.CLASS);
                }
            });
        }
    }
}

Affix.CLASS = 'affix';
Affix.CLASSY_BOTTOM = 'affix-bottom';

export default Affix;
