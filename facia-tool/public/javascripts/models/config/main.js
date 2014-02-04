/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'utils/fetch-settings',
    'utils/update-scrollables',
    'models/config/front'
], function(
    config,
    ko,
    vars,
    fetchSettings,
    updateScrollables,
    Front
) {
    return function() {
        var model = {
                collections: ko.observableArray(),
                fronts: ko.observableArray()
            };

        this.init = function() {
            fetchSettings(function (config, switches) {

                model.collections(
                   _.chain(config.collections)
                    .map(function(val, key) { return {id: key, meta: val}; })
                    .sortBy(function (obj) { return obj.id; })
                    .value()
                );

                model.fronts(_.map(config.fronts, function(val, key) {
                    return new Front({id: key, collections: val.collections});
                }));

                vars.state.switches = switches || {};
            }, vars.CONST.configSettingsPollMs)
            .done(function() {
                ko.applyBindings(model);

                updateScrollables();
                window.onresize = updateScrollables;
            });
        };
    };
});
