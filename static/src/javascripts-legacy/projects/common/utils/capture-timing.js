define([
    'ophan/ng',
    'common/utils/user-timing'
], function (ophan, userTiming) {
    return function captureTiming(timingLabel) {
        var currentTime = parseFloat(userTiming.getCurrentTime().toFixed(2));

        ophan.record({
            component: timingLabel,
            value: currentTime
        });
    }
});
