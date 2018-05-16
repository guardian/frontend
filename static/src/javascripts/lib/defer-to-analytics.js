// @flow
import config from 'lib/config';

const analyticsReady = new Promise(resolve => {
    const check = () => {
        if (config.get('modules.media.analyticsReady')) {
            resolve(true);
            return;
        } else {
            setTimeout(check, 100);
        }
    };
    check();
});

const deferToAnalytics = (afterAnalytics: () => void): void => {
    analyticsReady.then(afterAnalytics);
};

export default deferToAnalytics;
