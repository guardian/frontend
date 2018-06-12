// @flow
import mediator from 'lib/mediator';

const mediaListener = (): void => {
    if (window.matchMedia) {
        const mql = window.matchMedia('print');
        mql.addListener(
            (): void => {
                if (mql.matches) {
                    mediator.emit('module:clickstream:interaction', 'print');
                }
            }
        );
    }
};

export { mediaListener };
