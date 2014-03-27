/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'modules/authed-ajax',
    'utils/fetch-settings',
    'utils/update-scrollables',
    'utils/clean-clone',
    'utils/clone-with-key',
    'utils/find-first-by-id',
    'utils/terminate',
    'models/group',
    'models/config/droppable',
    'models/config/front',
    'models/config/collection'
], function(
    config,
    ko,
    vars,
    authedAjax,
    fetchSettings,
    updateScrollables,
    cleanClone,
    cloneWithKey,
    findFirstById,
    terminate,
    Group,
    droppable,
    Front,
    Collection
) {
    return function() {

        var model = vars.model = {};

        model.collections = ko.observableArray();
        model.fronts = ko.observableArray();
        model.pinnedFront = ko.observable();
        model.pending = ko.observable();

        model.types =  [''].concat(vars.CONST.types);
        model.groups = [''].concat(vars.CONST.groups);

        model.clipboard = new Group({
            parentType: 'Clipboard',
            reflow: updateScrollables,
            keepCopy:  true
        });

        model.orphans = ko.computed(function() {
            return _.filter(model.collections(), function(collection) {
                return collection.parents().length === 0;
            });
        }, this);

        model.createFront = function() {
            var front;

            if (vars.model.fronts().length <= vars.CONST.maxFronts) {
                front =  new Front();
                model.pinnedFront(front);
                model.fronts.unshift(front);
                model.openFront(front);
            } else {
                window.alert('The maximum number of fronts (' + vars.CONST.maxFronts + ') has been exceeded. Please delete one first, by removing all its collections.');
            }
        };

        model.openFront = function(front) {
            _.each(model.fronts(), function(f){
                f.setOpen(f === front);
            });
        };

        model.createCollection = function() {
            var collection = new Collection();

            collection.toggleOpen();
            model.collections.unshift(collection);
        };

        model.save = function(affectedCollections) {
            var serialized = serialize(model);

            if(!_.isEqual(serialized, vars.state.config)) {
                model.pending(true);
                authedAjax.request({
                    url: vars.CONST.apiBase + '/config',
                    type: 'post',
                    data: JSON.stringify(serialized)
                })
                .then(function() {
                    bootstrap({
                        force: true,
                        openFronts: _.reduce(model.fronts(), function(openFronts, front) {
                            openFronts[front.id()] = front.state.open();
                            return openFronts;
                        }, {})
                    })
                    .done(function() {
                        model.pending(false);
                        if (affectedCollections) {
                            _.each([].concat(affectedCollections), pressCollection);
                        }
                    });
                });
            }
        };

        function pressCollection(collection) {
            return authedAjax.request({
                url: vars.CONST.apiBase + '/collection/update/' + collection.id,
                type: 'post'
            });
        }

        function serialize(model) {
            return {
                fronts:
                   _.chain(model.fronts())
                    .filter(function(front) { return front.id() && front.collections.items().length > 0; })
                    .reduce(function(fronts, front) {
                        var collections = _.chain(front.collections.items())
                             .filter(function(collection) {
                                return model.collections.indexOf(collection) > -1;
                             })
                             .map(function(collection) {
                                return collection.id;
                             })
                             .value();

                        if (collections.length > 0) {
                            fronts[front.id()] = _.reduce(front.props, function(obj, val, key) {
                                if (val()) {
                                    obj[key] = val();
                                }
                                return obj;
                            }, {collections: collections});
                        }
                        return fronts;
                    }, {})
                    .value(),

                collections:
                   _.chain(model.collections())
                    .filter(function(collection) { return collection.id; })
                    .reduce(function(collections, collection) {
                        collections[collection.id] =
                           _.reduce(collection.meta, function(acc, val, key) {
                                var v = _.isFunction(val) ? val() : val;
                                if(v) {
                                    acc[key] = (key === 'groups' ? v.split(',') : v);
                                }
                                return acc;
                            }, {});
                        return collections;
                    }, {})
                    .value()
            };
        }

        function bootstrap(opts) {
            opts.openFronts = opts.openFronts|| {};

            return fetchSettings(function (config, switches) {
                if (switches['facia-tool-configuration-disable']) {
                    terminate('The configuration tool has been switched off.', '/');
                    return;
                }
                vars.state.switches = switches;

                if (opts.force || !_.isEqual(config, vars.state.config)) {
                    vars.state.config = config;

                    model.collections(
                       _.map(config.collections, function(obj, cid) {
                            return new Collection(cloneWithKey(obj, cid));
                        })
                    );

                    model.fronts(
                       _.chain(_.keys(config.fronts))
                        .sortBy(function(id) { return id; })
                        .without(model.pinnedFront() ? model.pinnedFront().id() : undefined)
                        .unshift(model.pinnedFront() ? model.pinnedFront().id() : undefined)
                        .filter(function(id) { return id; })
                        .map(function(id) {
                            var front = new Front(cloneWithKey(config.fronts[id], id));

                            front.state.open(opts.openFronts[id]);
                            return front;
                        })
                       .value()
                    );
                }
            }, opts.pollingMs, opts.terminateOnFail);
        }

        this.init = function() {
            droppable.init();

            bootstrap({
                pollingMs: vars.CONST.configSettingsPollMs,
                terminateOnFail: true

            }).done(function() {
                ko.applyBindings(model);

                updateScrollables();
                window.onresize = updateScrollables;
            });
        };
    };
});
