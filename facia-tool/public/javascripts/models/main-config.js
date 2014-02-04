/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'utils/fetch-settings'
], function(
    config,
    ko,
    vars,
    fetchSettings
) {
    return function() {
        var model = {
                config: ko.observable(),
                splat: ko.observable()
            };

        this.init = function() {
            fetchSettings(function (config, switches) {
                model.config(config);
                vars.state.switches = switches || {};
            }, vars.CONST.configSettingsPollMs)
            .done(function() {
                model.splat(JSON.stringify(model.config(), undefined, 2));
                ko.applyBindings(model);
            });
        };
    };
});
