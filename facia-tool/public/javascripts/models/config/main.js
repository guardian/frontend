/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'utils/fetch-settings',
    'utils/update-scrollables',
    'utils/clone-with-key',
    'models/config/droppable',
    'models/config/front',
    'models/config/collection'
], function(
    config,
    ko,
    vars,
    fetchSettings,
    updateScrollables,
    cloneWithKey,
    droppable,
    Front,
    Collection
) {
    return function() {

        var model = {
                collections: ko.observableArray(),

                fronts: ko.observableArray(),

                createCollection: function () {
                    var collection = new Collection({
                        id: 'collection/' + Math.random(),
                        roleName: 'Untitled collection'
                    });
                    collection.toggleOpen();
                    model.collections.unshift(collection);
                }
            };

        vars.model = model;

        this.init = function() {
            droppable.init();

            fetchSettings(function (config, switches) {
                vars.state.switches = switches || {};
                if (!_.isEqual(config, vars.state.config)) {
                    vars.state.config = config || {};

                    model.collections(
                       _.chain(config.collections)
                        .map(function(obj, id) { return new Collection(cloneWithKey(obj, id)); })
                        .sortBy(function (obj) { return obj.id; })
                        .value()
                    );

                    model.fronts(
                       _.chain(config.fronts)
                        .map(function(obj, id) { return new Front(cloneWithKey(obj, id)); })
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
