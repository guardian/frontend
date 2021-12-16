import { mediator } from 'lib/mediator';

const mediaListener = () => {
    if (window.matchMedia) {
        const mql = window.matchMedia('print');
        mql.addListener(
            () => {
                if (mql.matches) {
                    mediator.emit('module:clickstream:interaction', 'print');
                }
            }
        );
    }
};

export { mediaListener };
