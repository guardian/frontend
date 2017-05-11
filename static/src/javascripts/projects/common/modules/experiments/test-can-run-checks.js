import config from 'lib/config';

function isTestSwitchedOn(test) {
    return config.switches['ab' + test.id];
}

function isExpired(testExpiry) {
    // new Date(test.expiry) sets the expiry time to 00:00:00
    // Using SetHours allows a test to run until the END of the expiry day
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    return startOfToday > new Date(testExpiry);
}

function testCanBeRun(test) {
    const expired = isExpired(test.expiry), isSensitive = config.page.isSensitive;

    return ((isSensitive ? test.showForSensitive : true) && isTestSwitchedOn(test)) && !expired && (!test.canRun || test.canRun());
}

export default {
    isExpired,
    testCanBeRun
}
