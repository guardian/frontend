/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'utils/fetch-settings',
    'utils/update-scrollables',
    'models/config/droppable',
    'models/config/front',
    'models/config/collection'
], function(
    config,
    ko,
    vars,
    fetchSettings,
    updateScrollables,
    droppable,
    Front,
    Collection
) {
    return function() {

        var model = {
                collections: ko.observableArray(),
                fronts: ko.observableArray()
            };

        this.init = function() {
            droppable.init();

            fetchSettings(function (config, switches) {
                vars.state.switches = switches || {};
                if (!_.isEqual(config, vars.state.config)) {
                    vars.state.config = config || {};

                    model.collections(
                       _.chain(config.collections)
                        .map(function(val, key) { return new Collection({id: key, meta: val}); })
                        .sortBy(function (obj) { return obj.id; })
                        .value()
                    );

                    model.fronts(
                       _.chain(config.fronts)
                        .map(function(val, key) { return new Front({id: key, collections: val.collections}); })
                        .value()
                    );
                }
            }, vars.CONST.configSettingsPollMs)
            .done(function() {
                ko.applyBindings(model);

                updateScrollables();
                window.onresize = updateScrollables;
            });
        };
    };
});
