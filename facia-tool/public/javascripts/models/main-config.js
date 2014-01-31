/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'utils/fetch-config',
    'utils/fetch-switches'
], function(
    config,
    ko,
    vars,
    fetchConfig,
    fetchSwitches
) {
    return function() {
        var model = {
                config: ko.observable(),
                fronts: ko.observableArray(),

                splat: ko.observable()
            };

        this.init = function() {
            $.when(fetchConfig(model, true), fetchSwitches(true))
            .done(function(){
                model.splat(JSON.stringify(model.config(), undefined, 2));

                ko.applyBindings(model);
            });
        };
    };
});
