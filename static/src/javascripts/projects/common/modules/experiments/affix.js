// @flow

import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';

const getPixels = (top: string): number =>
    top !== 'auto' ? parseInt(top, 10) : 0;

class Affix {
    affixed: boolean;
    $markerTop: bonzo;
    $markerBottom: bonzo;
    $container: bonzo;
    $element: bonzo;
    $window: bonzo;

    constructor(options: {
        element: ?HTMLElement,
        topMarker: ?HTMLElement,
        bottomMarker: ?HTMLElement,
        containerElement: ?HTMLElement,
    }): void {
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

    calculateContainerPositioning(): void {
        fastdom
            .write(() => {
                this.$container.css('top', '0');
            })
            .then(() =>
                fastdom.read(
                    () =>
                        this.$markerTop.offset().top -
                        this.$container.offset().top
                )
            )
            .then(containerTop => {
                fastdom.write(() => {
                    this.$container.css('top', `${containerTop}px`);
                });
            });
    }

    checkPosition(): void {
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
                fastdom.write(() => {
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
                fastdom.write(() => {
                    this.$container.css('top', `${topStyle}px`);
                    this.$container.addClass(affixBottomClass);
                });
            }

            fastdom.write(() => {
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
