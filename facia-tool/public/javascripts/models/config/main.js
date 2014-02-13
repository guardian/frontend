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
                    var front =  new Front();

                    model.fronts.unshift(front);
                    front.toggleOpen();
                },

                createCollection: function() {
                    var collection = new Collection({
                        id: guid()
                    });
                    collection.toggleOpen();
                    model.collections.unshift(collection);
                },

                tones:  [''].concat(vars.CONST.tones),
                groups: [''].concat(vars.CONST.groups),

                save: function() {
                    sanitize();
                    window.console.log(JSON.stringify(serialize(), null, 4));
                }
            };

        model.orphans = ko.computed(function() {
            return _.filter(model.collections(), function(collection) {
                return collection.parents().length === 0;
            });
        }, this);

        vars.model = model;

        function serialize() {
            return {
                fronts: _.reduce(model.fronts(), function(fronts, front) {
                    fronts[front.id()] = {
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
        }

        function sanitize() {
            model.fronts.remove(function(front) {
                return front.group.items().length === 0;
            });

            _.each(model.fronts(), function(front) {
                front.group.items.remove(function(collection) {
                    return model.collections.indexOf(collection) < 0;
                });
            });
        }

        this.init = function() {
            droppable.init();
            //hoverable.init();

            fetchSettings(function (config, switches) {
                vars.state.switches = switches || {};

                if (!_.isEqual(config, vars.state.config)) {
                    vars.state.config = config;

                    model.collections(
                       _.map(config.collections, function(obj, cid) {
                            return new Collection(cloneWithKey(obj, cid));
                        })
                    );

                    model.fronts(
                      _.map(config.fronts, function(obj, fid) {
                            return new Front(cloneWithKey(obj, fid));
                       })
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
