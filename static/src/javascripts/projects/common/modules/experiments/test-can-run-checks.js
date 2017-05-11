// @flow
import type { ABTest } from 'common/modules/experiments/ab-types';

import config from 'lib/config';

const isTestSwitchedOn = (test: ABTest): boolean =>
    config.switches[`ab${test.id}`];


export const isExpired = (testExpiry: string) => {
    // new Date(test.expiry) sets the expiry time to 00:00:00
    // Using SetHours allows a test to run until the END of the expiry day
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    return startOfToday > new Date(testExpiry);
};


export const testCanBeRun = (test: ABTest): boolean => {
    const expired = isExpired(test.expiry);
    const isSensitive = config.page.isSensitive;
    return (
        (isSensitive ? !!test.showForSensitive : true) &&
        isTestSwitchedOn(test) &&
        !expired &&
        (!test.canRun || test.canRun())
    );
};
