// @flow

import ophan from 'ophan/ng';

const tracking = function(trackingObj: {
    widgetId?: ?string,
    state?: string,
}): void {
    ophan.record({
        outbrain: trackingObj,
    });
};

export { tracking };
