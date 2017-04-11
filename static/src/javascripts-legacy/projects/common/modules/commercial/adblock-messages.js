define([
    'lib/config',
    'lib/detect',
    'lib/storage',
    'commercial/modules/user-features',
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
        var alreadyVisited = storage.localStorage.get('gu.alreadyVisited') || 0;

        return alreadyVisited > 1;
    }

    function isAdblockSwitchOn() {
        return config.switches.adblock;
    }

    function noAdblockMsg() {
        if(notMobile()) {
            if(!visitedMoreThanOnce() || !isAdblockSwitchOn()) {
                return adblockInUse();
            }

            if (visitedMoreThanOnce() && isPayingMember()) {
                return adblockInUse();
            }
        }
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
