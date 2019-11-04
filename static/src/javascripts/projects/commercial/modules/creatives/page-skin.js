// @flow
import config from 'lib/config';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { isBreakpoint, hasCrossedBreakpoint } from 'lib/detect';
import mediator from 'lib/mediator';
import fastdom from 'fastdom';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

const pageSkin = (): void => {
    const bodyEl = document.body;
    const hasPageSkin: boolean = config.get('page.hasPageSkin');

    const isInAuRegion = (): boolean =>
        ['AU', 'NZ'].includes(geolocationGetSync());

    let topPosition: number = 0;

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
                topPosition = navHeader.offsetTop + navHeader.offsetHeight;
            }
        }
    };

    // This is to reposition the Page Skin to start where the navigation header ends.
    const repositionSkin = (): void => {
        if (hasPageSkin && isInAuRegion()) {
            initTopPositionOnce();
            if (window.pageYOffset === 0) {
                moveBackgroundVerticalPosition(topPosition);
            } else if (window.pageXOffset <= topPosition) {
                moveBackgroundVerticalPosition(
                    topPosition - window.pageYOffset
                );
            }
            if (window.pageYOffset > topPosition) {
                moveBackgroundVerticalPosition(0);
            }
        }
    };

    togglePageSkin();

    mediator.on('window:throttledResize', togglePageSkin);
    mediator.on('window:throttledScroll', repositionSkin);
    mediator.on('modules:commercial:dfp:rendered', repositionSkin);
};

export { pageSkin };
