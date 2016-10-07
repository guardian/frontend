define([
    'commercial/modules/dfp/dfp-env'
], function (dfpEnv) {
    return getAdvertById;

    function getAdvertById(id) {
        return id in dfpEnv.advertIds ? dfpEnv.adverts[dfpEnv.advertIds[id]] : null;
    }
});
