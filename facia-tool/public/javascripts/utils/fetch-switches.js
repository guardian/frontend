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
        return authedAjax.request({
            url: vars.CONST.apiBase + '/switches'
        })
        .fail(function () {
            if(terminateOnFail) {
                terminate("the switches are unavailable");
            }
        })
        .done(function(switches) {
            if (switches['facia-tool-disable']) {
                terminate();
            }
            vars.state.switches = switches || {};
        });
    };
});
