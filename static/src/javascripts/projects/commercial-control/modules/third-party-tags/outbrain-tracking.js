// @flow

import ophan from 'ophan/ng';

const tracking = (trackingObj: { widgetId?: string }): void => {
    ophan.record({
        outbrain: trackingObj,
    });
};

export { tracking };
