import fastdom from 'fastdom';
import config from '../../../../lib/config';
import { hasCrossedBreakpoint, isBreakpoint } from '../../../../lib/detect';
import mediator from '../../../../lib/mediator';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';

const pageSkin = () => {
    const bodyEl = document.body;
    const hasPageSkin = config.get('page.hasPageSkin');
    const isInAUEdition = config.get('page.edition', '').toLowerCase() === 'au';
    const adLabelHeight = 24;
    let topPosition = 0;
    let truskinRendered = false;
    let pageskinRendered = false;

    const togglePageSkinActiveClass = () => {
        if (bodyEl) {
            fastdom.mutate(() => {
                bodyEl.classList.toggle(
                    'has-active-pageskin',
                    isBreakpoint({ min: 'wide' })
                );
            });
        }
    };

    const togglePageSkin = () => {
        if (
            hasPageSkin &&
            hasCrossedBreakpoint(true) &&
            !commercialFeatures.adFree
        ) {
            togglePageSkinActiveClass();
        }
    };

    const moveBackgroundVerticalPosition = (verticalPos) => {
        if (bodyEl) {
            bodyEl.style.backgroundPosition = `50% ${verticalPos}px`;
        }
    };

    const initTopPositionOnce = () => {
        if (topPosition === 0) {
            const navHeader = document.getElementsByClassName('new-header')[0];
            if (navHeader) {
                topPosition = truskinRendered
                    ? navHeader.offsetTop + adLabelHeight
                    : navHeader.offsetTop + navHeader.offsetHeight;
            }
        }
    };

    const shrinkElement = (element) => {
        const frontContainer = document.querySelector('.fc-container__inner');
        if (frontContainer) {
            element.style.cssText = `max-width: ${
                frontContainer.clientWidth
            }px; margin-right: auto; margin-left: auto;`;
        }
    };

    const repositionTruskin = () => {
        const header = document.querySelector('.new-header');
        const footer = document.querySelector('.l-footer');
        const topBannerAd = document.querySelector('.ad-slot--top-banner-ad');

        if (header && footer && topBannerAd) {
            const topBannerAdContainer = document.querySelector(
                '.top-banner-ad-container'
            );
            if (topBannerAdContainer) {
                topBannerAdContainer.style.borderBottom = 'none';
            }
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
        }
    };

    const repositionPageSkin = () => {
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

    const repositionSkins = () => {
        if (truskinRendered && hasPageSkin) {
            repositionTruskin();
        }
        // This is to reposition the Page Skin to start where the navigation header ends.
        if (pageskinRendered && hasPageSkin && isInAUEdition) {
            repositionPageSkin();
        }
    };

    togglePageSkin();

    window.addEventListener(
        'message',
        event => {
            // This event is triggered by the commercial template: 'Skin for front pages'
            // Also found in: commercial-templates/src/page-skin/web/index.html
            if (event.data === 'pageskinRendered') {
                pageskinRendered = true;
                repositionSkins();
            }
            // This event is triggered by the commercial template: 'Truskin Template' to indicate the page skin is also a Truskin
            // Also found in: commercial-templates/src/truskin-page-skin/web/index.js
            if (event.data === 'truskinRendered') {
                truskinRendered = true;
                repositionSkins();
            }
        },
        false
    );

    mediator.on('window:throttledResize', togglePageSkin);

    if (hasPageSkin) {
        mediator.on('window:throttledScroll', repositionSkins);
    }
};

export { pageSkin };
