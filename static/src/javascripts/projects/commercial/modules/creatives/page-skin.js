// @flow
import config from 'lib/config';
import { isBreakpoint, hasCrossedBreakpoint } from 'lib/detect';
import mediator from 'lib/mediator';
import fastdom from 'fastdom';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

const pageSkin = (): void => {
    const bodyEl = document.body;
    const hasPageSkin: boolean = config.get('page.hasPageSkin');

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

    togglePageSkin();

    mediator.on('window:throttledResize', togglePageSkin);
};

export { pageSkin };
