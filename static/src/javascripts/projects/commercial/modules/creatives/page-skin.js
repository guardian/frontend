// @flow
import config from 'lib/config';
import detect from 'lib/detect';
import mediator from 'lib/mediator';
import fastdom from 'fastdom';

const pageSkin = (): void => {
    const bodyEl = document.body;
    const hasPageSkin: boolean = config.page.hasPageSkin;

    const togglePageSkinActiveClass = (): void => {
        if (bodyEl) {
            fastdom.mutate(() => {
                bodyEl.classList.toggle(
                    'has-active-pageskin',
                    detect.isBreakpoint({ min: 'wide' })
                );
            });
        }
    };

    const togglePageSkin = (): void => {
        if (hasPageSkin && detect.hasCrossedBreakpoint(true)) {
            togglePageSkinActiveClass();
        }
    };

    togglePageSkin();

    mediator.on('window:throttledResize', togglePageSkin);
};

export { pageSkin };
