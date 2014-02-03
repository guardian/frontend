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
    return function (model, terminateOnFail) {
        return authedAjax.request({
            url: vars.CONST.apiBase + '/config'
        })
        .fail(function () {
            if(terminateOnFail) {
                terminate("the config was not available");
            }
        })
        .done(function(config) {
            if (_.isObject(config.fronts) && _.isObject(config.collections)) {
                if (model.config) {
                    model.config(config);
                }
                if (model.fronts) {
                    model.fronts(_.keys(config.fronts));
                }
            } else if (terminateOnFail ) {
                terminate("the config is invalid.");
            }
        });
    };
});
