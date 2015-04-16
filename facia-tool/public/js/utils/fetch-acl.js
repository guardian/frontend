define([
    'modules/authed-ajax'
], function (
    authedAjax
) {
    return function () {
        return authedAjax.request({
            url: '/acl'
        });
    };
});
