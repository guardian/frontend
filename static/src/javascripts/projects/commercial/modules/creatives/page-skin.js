// @flow
import config from 'lib/config';
import { isBreakpoint, hasCrossedBreakpoint } from 'lib/detect';
import mediator from 'lib/mediator';
import fastdom from 'fastdom';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

const pageSkin = (): void => {
    const bodyEl = document.body;
    const hasPageSkin: boolean = config.get('page.hasPageSkin');
    const NAVMENU_END_POSITION: Number = 508;

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
        bodyEl.style.backgroundPosition = '50% ' + verticalPos + 'px';
    };

    const repositionSkin = (): void => {
        if (bodyEl && hasPageSkin) {
            if (window.pageYOffset === 0) {
                moveBackgroundVerticalPosition(NAVMENU_END_POSITION);
            } else if (window.pageXOffset <= NAVMENU_END_POSITION) {
                moveBackgroundVerticalPosition(NAVMENU_END_POSITION - window.pageYOffset);
            } if (window.pageYOffset > NAVMENU_END_POSITION){
                moveBackgroundVerticalPosition(0);
            }
        }
    };

    togglePageSkin();
    repositionSkin();

    mediator.on('window:throttledResize', togglePageSkin);
    mediator.on('window:throttledScroll', repositionSkin);
};

export { pageSkin };
