/* global _: true */
define([
    'modules/vars',
    'modules/authed-ajax',
    'utils/terminate'
], function(
    vars,
    authedAjax,
    terminate
) {
    return function (terminateOnFail) {
        var deferred = $.Deferred();

        authedAjax.request({
            url: vars.CONST.apiBase + '/switches'
        })
        .fail(function () {
            if(terminateOnFail) {
                terminate("the switches are invalid or unvailable");
            }
            deferred.reject();
        })
        .done(function(switches) {
            switches = switches || {};
            if (switches['facia-tool-disable']) {
                terminate();
            }
            deferred.resolve(switches);
        });

        return deferred.promise();
    };
});
