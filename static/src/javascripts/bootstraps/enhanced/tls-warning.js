// @flow

import ophan from 'ophan/ng';

const init = (): void => {
    const componentEvent = {
        component: 'tls-warning',
    };

    ophan.record(componentEvent);
};

export { init };
