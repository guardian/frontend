/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'utils/fetch-settings',
    'utils/update-scrollables',
    'utils/clone-with-key',
    'utils/find-first-by-id',
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
    findFirstById,
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
                    vars.state.config = config;

                    model.collections.removeAll();
                    model.fronts.removeAll();

                    _.each(config.fronts, function(f, fid) {
                        var front =  new Front(cloneWithKey(f, fid));

                        _.each(f.collections, function(cid) {
                            var collection = findFirstById(model.collections, cid);
                            if (!collection) {
                                collection = new Collection(cloneWithKey(config.collections[cid], cid));
                                model.collections.push(collection);
                            }
                            collection.parents.push(front);
                        });

                        front.populate(f.collections, model.collections);
                        model.fronts.push(front);
                    });

                    model.collections().concat(
                        _.map(config.collections, function(obj, cid) {
                            if (!findFirstById(model.collections, cid)) {
                                model.collections.push(new Collection(cloneWithKey(obj, cid)));
                            }
                        })
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
