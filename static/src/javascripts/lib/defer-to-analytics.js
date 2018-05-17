// @flow
import config from 'lib/config';

const deferToAnalytics = (afterAnalytics: () => void): void => {
    config.get('modules.tracking.ready').then(afterAnalytics);
};

export default deferToAnalytics;
