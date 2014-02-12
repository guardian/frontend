/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'bindings/hoverable',
    'utils/fetch-settings',
    'utils/update-scrollables',
    'utils/clean-clone',
    'utils/clone-with-key',
    'utils/find-first-by-id',
    'models/group',
    'models/config/droppable',
    'models/config/front',
    'models/config/collection'
], function(
    config,
    ko,
    vars,
    hoverable,
    fetchSettings,
    updateScrollables,
    cleanClone,
    cloneWithKey,
    findFirstById,
    Group,
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
                        displayName: 'Untitled collection'
                    });
                    collection.toggleOpen();
                    model.collections.unshift(collection);
                }
            };

        model.save = function() {
            var obj = {
                fronts: _.reduce(model.fronts(), function(fronts, front) {
                    fronts[front.id] = {
                        collections: _.map(front.group.items(), function(collection) {
                            return collection.id;
                        })
                    };
                    return fronts;
                }, {}),

                collections: _.reduce(model.collections(), function(collections, collection) {
                    collections[collection.id] =
                       _.reduce(collection.meta, function(acc, val, key) {
                            acc[key] = _.isFunction(val) ? val() : val;
                            return acc;
                        }, {});

                    return collections;
                }, {})
           };

           window.console.log(JSON.stringify(obj, null, 4));
        };

        vars.model = model;

        this.init = function() {
            droppable.init();
            hoverable.init();

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

                    ko.utils.arrayPushAll(
                        model.collections,
                       _.chain(config.collections)
                        .map(function(obj, cid) {
                            return findFirstById(model.collections, cid) ? false : new Collection(cloneWithKey(obj, cid));
                        })
                        .filter(function(collection) { return collection; })
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
