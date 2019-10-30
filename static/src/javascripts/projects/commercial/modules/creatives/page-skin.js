// @flow
import config from 'lib/config';
import { isBreakpoint, hasCrossedBreakpoint } from 'lib/detect';
import mediator from 'lib/mediator';
import fastdom from 'fastdom';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

const pageSkin = (): void => {
    const bodyEl = document.body;
    const hasPageSkin: boolean = config.get('page.hasPageSkin');
    let topPosition: Number;

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

    const moveBackgroundVerticalPosition = (verticalPos: Number): void => {
        bodyEl.style.backgroundPosition = `50% ${verticalPos}px`;
    };

    //This is to reposition the Page Skin to start where the navigation header ends.
    const repositionSkin = (): void => {
        if (bodyEl && hasPageSkin) {
            if (!topPosition) {
                const navHeader = document.getElementsByClassName('new-header')[0];
                topPosition = navHeader.offsetTop + navHeader.offsetHeight;
            }
            moveBackgroundVerticalPosition(topPosition);
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
