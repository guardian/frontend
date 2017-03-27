// @flow
import mediator from 'lib/mediator';

let analyticsReady = false;

mediator.on('analytics:ready', () => {
    analyticsReady = true;
});

const deferToAnalytics = (afterAnalytics: () => void): void => {
    if (analyticsReady) {
        afterAnalytics();
    } else {
        mediator.on('analytics:ready', () => {
            afterAnalytics();
        });
    }
};

export default deferToAnalytics;
