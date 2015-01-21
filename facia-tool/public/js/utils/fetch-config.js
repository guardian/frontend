define([
    'underscore',
    'jquery',
    'modules/vars',
    'modules/authed-ajax',
    'utils/terminate'
], function (
    _,
    $,
    vars,
    authedAjax,
    terminate
) {
    return function (terminateOnFail) {
        var deferred = $.Deferred();

        authedAjax.request({
            url: vars.CONST.apiBase + '/config'
        })
        .fail(function () {
            if(terminateOnFail) {
                terminate('the config is invalid or unvailable');
            }
            deferred.reject();
        })
        .done(function(config) {
            if (_.isObject(config.fronts) && _.isObject(config.collections)) {
                deferred.resolve(config);
            } else if (terminateOnFail ) {
                terminate('the config is invalid.');
            } else {
                deferred.reject();
            }
        });

        return deferred.promise();
    };
});
