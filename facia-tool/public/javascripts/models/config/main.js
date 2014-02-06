/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'utils/fetch-settings',
    'utils/update-scrollables',
    'utils/clean-clone',
    'utils/kv-2-obj',
    'models/config/droppable',
    'models/config/front',
    'models/config/collection'
], function(
    config,
    ko,
    vars,
    fetchSettings,
    updateScrollables,
    cleanClone,
    kv2obj,
    droppable,
    Front,
    Collection
) {
    return function() {

        function pack(obj, id) {
            var nuObj = cleanClone(obj);
            nuObj.id = id;
            return nuObj;
        }

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
                        .map(function(obj, id) { return new Collection(kv2obj(obj, id)); })
                        .sortBy(function (obj) { return obj.id; })
                        .value()
                    );

                    model.fronts(
                       _.chain(config.fronts)
                        .map(function(obj, id) { return new Front(kv2obj(obj, id)); })
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
