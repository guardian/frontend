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
    'utils/guid',
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
    guid,
    Group,
    droppable,
    Front,
    Collection
) {
    return function() {

        var model = {
                collections: ko.observableArray(),

                fronts: ko.observableArray(),

                createFront: function() {
                    var path = 'foo',
                        front =  new Front({id: path}),
                        collection = findFirstById(model.collections, path);

                    if (!collection) {
                        collection = new Collection({
                            id: path,
                            displayName: 'Top Stories'
                        });
                        model.collections.unshift(collection);
                    }

                    front.group.items.push(collection);
                    model.fronts.push(front);

                    front.toggleOpen();
                    collection.toggleOpen();
                },

                createCollection: function() {
                    var collection = new Collection({
                        id: guid()
                    });
                    collection.toggleOpen();
                    model.collections.unshift(collection);
                },

                tones:  [''].concat(vars.CONST.tones),
                groups: [''].concat(vars.CONST.groups)
            };

        model.save = function() {

            // tidy up
            _.each(model.fronts(), function(front) {
                front.group.items.remove(function(collection) {
                    return !collection.meta.displayName();
                });
            });

            model.fronts.remove(function(front) {
                return front.group.items().length === 0;
            });

            model.collections.remove(function(collection) {
                return !collection.meta.displayName();
            });

            // serialize
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
                            var v = _.isFunction(val) ? val() : val;
                             // keep only the truthy values:
                            if(v) {
                                acc[key] = (key === 'groups' ? v.split(',') : v);
                            }
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
            }, vars.CONST.configSettingsPollMs, true)
            .done(function() {
                ko.applyBindings(model);

                updateScrollables();
                window.onresize = updateScrollables;
            });
        };
    };
});
