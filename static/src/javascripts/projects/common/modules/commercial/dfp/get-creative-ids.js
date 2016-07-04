define([
    'common/modules/commercial/dfp/private/dfp-env'
], function (dfpEnv) {
    return getCreativeIDs;

    function getCreativeIDs() {
        return dfpEnv.creativeIDs;
    }
});
