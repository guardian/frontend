define([
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'common/modules/commercial/user-features'
], function (
    config,
    detect,
    storage,
    userFeatures
) {
    function noAdblockMsg() {
        var alreadyVisited = storage.local.get('gu.alreadyVisited') || 0;

        return detect.adblockInUse() && detect.getBreakpoint() !== 'mobile' && (
                alreadyVisited <= 1 ||
                !config.switches.adblock ||
                (config.switches.adblock && alreadyVisited > 1 && userFeatures.isPayingMember()));
    }

    function showAdblockMsg() {
        var alreadyVisited = storage.local.get('gu.alreadyVisited') || 0;
        return detect.getBreakpoint() !== 'mobile' && detect.adblockInUse() && config.switches.adblock && alreadyVisited > 1 && !userFeatures.isPayingMember();
    }

    return {
        noAdblockMsg: noAdblockMsg,
        showAdblockMsg: showAdblockMsg
    };
});
