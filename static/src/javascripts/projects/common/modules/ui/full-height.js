import $ from 'lib/$';
import fastdom from 'lib/fastdom-promise';
import { mediator } from 'lib/mediator';
import { getBreakpoint } from 'lib/detect';

// Helper for full height elements as 100vh on mobile Chrome and Safari
// changes as the url bar slides in and out
// http://code.google.com/p/chromium/issues/detail?id=428132

const renderBlock = (state) =>
    fastdom
        .mutate(() => {
            state.$el.css('height', '');
        })
        .then(() => {
            if (state.isMobile) {
                return fastdom
                    .measure(() => state.$el.height())
                    .then(height =>
                        fastdom.mutate(() => {
                            state.$el.css('height', height);
                        })
                    );
            }
        });

const render = (state) => {
    state.elements.forEach(element => {
        renderBlock({ $el: $(element), isMobile: state.isMobile });
    });
};

const getState = () =>
    fastdom.measure(() => {
        const elements = Array.from(
            document.getElementsByClassName('js-is-fixed-height')
        );

        return { elements, isMobile: getBreakpoint() === 'mobile' };
    });

const onViewportChange = () => {
    getState().then(render);
};

const init = () => {
    mediator.on('window:throttledResize', onViewportChange);
    mediator.on('window:orientationchange', onViewportChange);

    onViewportChange();
};

export { init };
