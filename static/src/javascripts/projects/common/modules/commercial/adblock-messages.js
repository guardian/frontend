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
    function sharedRules() {
        var alreadyVisted = storage.local.get('gu.alreadyVisited') || 0;

        return detect.getBreakpoint() !== 'mobile' && detect.adblockInUse() && config.switches.adblock && alreadyVisted > 1;
    }

    function noAdblockMsg() {
        return (sharedRules() && userFeatures.isPayingMember()) || !sharedRules();
    }

    function showAdblockMsg() {
        return sharedRules() && !userFeatures.isPayingMember();
    }

    return {
        noAdblockMsg: noAdblockMsg,
        showAdblockMsg: showAdblockMsg
    };
});
