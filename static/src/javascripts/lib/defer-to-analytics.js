// @flow
import config from 'lib/config';

const deferToAnalytics = (afterAnalytics: () => void): void => {
    try {
        config.get('modules.tracking.ready').then(afterAnalytics);
    } catch (e) {} // eslint-disable-line no-empty
};

export default deferToAnalytics;
