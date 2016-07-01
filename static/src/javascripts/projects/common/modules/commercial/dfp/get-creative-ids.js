define([
    'common/modules/commercial/dfp/dfp-obj',
    'common/modules/commercial/dfp/private/dfp-env'
], function (dfp, dfpEnv) {
    dfp.getCreativeIDs = getCreativeIDs;
    return getCreativeIDs;

    function getCreativeIDs() {
        return dfpEnv.creativeIDs;
    }
});
