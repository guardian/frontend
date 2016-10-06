define([
    'commercial/modules/dfp/dfp-env'
], function (dfpEnv) {
    return getCreativeIDs;

    function getCreativeIDs() {
        return dfpEnv.creativeIDs;
    }
});
