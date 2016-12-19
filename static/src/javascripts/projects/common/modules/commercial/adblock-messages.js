define([
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'common/modules/commercial/user-features',
    'Promise'
], function (
    config,
    detect,
    storage,
    userFeatures,
    Promise
) {
    function adblockInUse() {
        return detect.adblockInUse;
    }

    function notMobile() {
        return detect.getBreakpoint() !== 'mobile';
    }

    function isPayingMember() {
        return userFeatures.isPayingMember();
    }

    function visitedMoreThanOnce() {
        var alreadyVisited = storage.local.get('gu.alreadyVisited') || 0;

        return alreadyVisited > 1;
    }

    function isAdblockSwitchOn() {
        return config.switches.adblock;
    }

    function noAdblockMsg() {

        return notMobile() && (!visitedMoreThanOnce() || !isAdblockSwitchOn() || (visitedMoreThanOnce() && isPayingMember())) ?
            adblockInUse() :
            Promise.resolve(false);
    }

    function showAdblockMsg() {
        return isAdblockSwitchOn() && !isPayingMember() && visitedMoreThanOnce()  && notMobile() ?
            adblockInUse() :
            Promise.resolve(false);
    }

    return {
        noAdblockMsg: noAdblockMsg,
        showAdblockMsg: showAdblockMsg
    };
});
