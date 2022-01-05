import bonzo from 'bonzo';
import { mediator } from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';

const getPixels = (top) =>
    top !== 'auto' ? parseInt(top, 10) : 0;

class Affix {


    constructor(options) {
        window.addEventListener('click', () => {
            this.checkPosition();
        });

        mediator.addListener('window:throttledScroll', () => {
            this.checkPosition();
        });

        mediator.addListener('window:throttledResize', () => {
            this.calculateContainerPositioning();
        });

        this.affixed = false;
        this.$markerTop = bonzo(options.topMarker);
        this.$markerBottom = bonzo(options.bottomMarker);
        this.$container = bonzo(options.containerElement);
        this.$element = bonzo(options.element);
        this.$window = bonzo(document.body);

        this.checkPosition();
        this.calculateContainerPositioning();
    }

    calculateContainerPositioning() {
        fastdom
            .mutate(() => {
                this.$container.css('top', '0');
            })
            .then(() =>
                fastdom.measure(
                    () =>
                        this.$markerTop.offset().top -
                        this.$container.offset().top
                )
            )
            .then(containerTop => {
                fastdom.mutate(() => {
                    this.$container.css('top', `${containerTop}px`);
                });
            });
    }

    checkPosition() {
        const scrollTop = this.$window.scrollTop();
        const markerTopTop = this.$markerTop.offset().top;
        const markerBottomTop = this.$markerBottom.offset().top;
        const elHeight = this.$element.dim().height;
        const topCheck = scrollTop >= markerTopTop;
        const bottomCheck = scrollTop + elHeight < markerBottomTop;
        const viewportCheck = elHeight < bonzo.viewport().height;
        const affixClass = 'affix';
        const affixBottomClass = 'affix-bottom';
        const affix = bottomCheck && topCheck && viewportCheck; // This is true when the element is positioned below the top threshold and above the bottom threshold.

        if (this.affixed !== affix) {
            this.affixed = affix;

            // Lock the affix container to the bottom marker.
            if (bottomCheck) {
                fastdom.mutate(() => {
                    this.$container.removeClass(affixBottomClass);
                });
                this.calculateContainerPositioning();
            } else {
                // Store the container top, which needs to be re-applied when affixed to bottom.
                const oldContainerStyling = getPixels(
                    this.$container.css('top')
                );
                const topStyle =
                    markerBottomTop -
                    markerTopTop -
                    elHeight +
                    oldContainerStyling;
                fastdom.mutate(() => {
                    this.$container.css('top', `${topStyle}px`);
                    this.$container.addClass(affixBottomClass);
                });
            }

            fastdom.mutate(() => {
                if (affix) {
                    this.$element.addClass(affixClass);
                } else {
                    this.$element.removeClass(affixClass);
                }
            });
        }
    }
}

export { Affix };
