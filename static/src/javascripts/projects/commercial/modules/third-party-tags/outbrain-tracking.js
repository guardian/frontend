// @flow

import ophan from 'ophan/ng';

const tracking = (trackingObj: {
    widgetId?: ?string,
    state?: string,
}): void => {
    ophan.record({
        outbrain: trackingObj,
    });
};

export { tracking };
