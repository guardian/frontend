// @flow
import config from 'lib/config';
import { isBreakpoint, hasCrossedBreakpoint } from 'lib/detect';
import mediator from 'lib/mediator';
import fastdom from 'fastdom';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

const pageSkin = (): void => {
    const bodyEl = document.body;
    const hasPageSkin: boolean = config.get('page.hasPageSkin');
    const isInAUEdition = config.get('page.edition', '').toLowerCase() === 'au';
    const adLabelHeight = 24;
    let topPosition: number = 0;
    let hasTruskin: boolean = false;

    const togglePageSkinActiveClass = (): void => {
        if (bodyEl) {
            fastdom.write(() => {
                bodyEl.classList.toggle(
                    'has-active-pageskin',
                    isBreakpoint({ min: 'wide' })
                );
            });
        }
    };

    const togglePageSkin = (): void => {
        if (
            hasPageSkin &&
            hasCrossedBreakpoint(true) &&
            !commercialFeatures.adFree
        ) {
            togglePageSkinActiveClass();
        }
    };

    const moveBackgroundVerticalPosition = (verticalPos: number): void => {
        if (bodyEl) {
            bodyEl.style.backgroundPosition = `50% ${verticalPos}px`;
        }
    };

    const initTopPositionOnce = (): void => {
        if (topPosition === 0) {
            const navHeader = document.getElementsByClassName('new-header')[0];
            if (navHeader) {
                topPosition = hasTruskin
                    ? navHeader.offsetTop + adLabelHeight
                    : navHeader.offsetTop + navHeader.offsetHeight;
            }
        }
    };

    const shrinkElement = (element: HTMLElement): void => {
        const frontContainer = document.querySelector('.fc-container__inner');
        if (frontContainer) {
            element.style.cssText = `max-width: ${
                frontContainer.clientWidth
            }px; margin-right: auto; margin-left: auto;`;
        }
    };

    const repositionTruskin = (
        header: HTMLElement,
        footer: HTMLElement,
        topBannerAd: HTMLElement
    ): void => {
        initTopPositionOnce();
        shrinkElement(header);
        shrinkElement(footer);

        if (window.pageYOffset === 0) {
            moveBackgroundVerticalPosition(topPosition);
        }

        const headerBoundaries = header.getBoundingClientRect();
        const topBannerAdBoundaries = topBannerAd.getBoundingClientRect();
        const headerPosition = headerBoundaries.top;
        const topBannerBottom = topBannerAdBoundaries.bottom;
        const fabricScrollStartPosition =
            topBannerAdBoundaries.height +
            adLabelHeight -
            headerBoundaries.height;

        if (
            headerPosition <= fabricScrollStartPosition &&
            topBannerBottom > 0
        ) {
            moveBackgroundVerticalPosition(topBannerBottom);
        } else if (topBannerBottom <= 0) {
            moveBackgroundVerticalPosition(0);
        }
    };

    const repositionPageSkin = (): void => {
        initTopPositionOnce();
        if (window.pageYOffset === 0) {
            moveBackgroundVerticalPosition(topPosition);
        } else if (window.pageXOffset <= topPosition) {
            moveBackgroundVerticalPosition(topPosition - window.pageYOffset);
        }
        if (window.pageYOffset > topPosition) {
            moveBackgroundVerticalPosition(0);
        }
    };

    const repositionSkin = (): void => {
        const header = document.querySelector('.new-header');
        const footer = document.querySelector('.l-footer');
        const topBannerAd = document.querySelector('.ad-slot--top-banner-ad');

        if (hasTruskin && header && topBannerAd && footer) {
            repositionTruskin(header, footer, topBannerAd);
        }
        // This is to reposition the Page Skin to start where the navigation header ends.
        if (!hasTruskin && hasPageSkin && isInAUEdition) {
            repositionPageSkin();
        }
    };

    togglePageSkin();

    const removeTopAdBorder = (): void => {
        const topBannerAdContainer = document.querySelector(
            '.top-banner-ad-container'
        );
        if (topBannerAdContainer) {
            topBannerAdContainer.style.borderBottom = 'none';
        }
    };

    window.addEventListener(
        'message',
        event => {
            if (event.data === 'truskinRendered') {
                hasTruskin = true;
                removeTopAdBorder();
                repositionSkin();
            }
        },
        false
    );

    mediator.on('window:throttledResize', togglePageSkin);
    mediator.on('window:throttledScroll', repositionSkin);
    mediator.on('modules:commercial:dfp:rendered', repositionSkin);
};

export { pageSkin };
