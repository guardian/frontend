// @flow

import { $ } from 'lib/$';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import { getBreakpoint } from 'lib/detect';

// Helper for full height elements as 100vh on mobile Chrome and Safari
// changes as the url bar slides in and out
// http://code.google.com/p/chromium/issues/detail?id=428132

const renderBlock = (state: Object): Promise<void> =>
    fastdom
        .write(() => {
            state.$el.css('height', '');
        })
        .then(() => {
            if (state.isMobile) {
                return fastdom
                    .read(() => state.$el.height())
                    .then(height =>
                        fastdom.write(() => {
                            state.$el.css('height', height);
                        })
                    );
            }
        });

const render = (state: Object): void => {
    state.elements.forEach(element => {
        renderBlock({ $el: $(element), isMobile: state.isMobile });
    });
};

const getState = (): Promise<{
    elements: Array<HTMLElement>,
    isMobile: boolean,
}> =>
    fastdom.read(() => {
        const elements = Array.from(
            document.getElementsByClassName('js-is-fixed-height')
        );

        return { elements, isMobile: getBreakpoint() === 'mobile' };
    });

const onViewportChange = (): void => {
    getState().then(render);
};

const init = (): void => {
    mediator.on('window:throttledResize', onViewportChange);
    mediator.on('window:orientationchange', onViewportChange);

    onViewportChange();
};

export { init };
