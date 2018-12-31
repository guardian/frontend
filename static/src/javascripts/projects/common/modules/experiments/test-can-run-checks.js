// @flow
import config from 'lib/config';

const isTestSwitchedOn = (test: ABTest): boolean =>
    config.switches[`ab${test.id}`];

export const isExpired = (testExpiry: string): boolean => {
    // new Date(test.expiry) sets the expiry time to 00:00:00
    // Using SetHours allows a test to run until the END of the expiry day
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    return startOfToday > new Date(testExpiry);
};

// If variant has a canRun, we should take into account.
// If not, assume it can run.
export const variantCanBeRun = (variant: Variant): boolean =>
    !(variant.canRun && !variant.canRun());

export const testCanBeRun = (test: ABTest): boolean => {
    const expired = isExpired(test.expiry);
    const isSensitive = config.page.isSensitive;
    const shouldShowForSensitive = !!test.showForSensitive;
    const isTestOn = isTestSwitchedOn(test);
    const canTestBeRun = !test.canRun || test.canRun();

    return (
        (isSensitive ? shouldShowForSensitive : true) &&
        isTestOn &&
        !expired &&
        canTestBeRun
    );
};
