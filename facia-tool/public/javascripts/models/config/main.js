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

        model.switches = ko.observable();

        model.navSections = [].concat(config.navSections);

        model.collections = ko.observableArray();

        model.fronts = ko.observableArray();

        model.pinnedFront = ko.observable();

        model.pending = ko.observable();

        model.types =  _.pluck(vars.CONST.types, 'name');

        model.clipboard = new Group({
            parentType: 'Clipboard',
            reflow: updateScrollables,
            keepCopy:  true
        });

        model.createFront = function() {
            var front;

            if (vars.model.fronts().length <= vars.CONST.maxFronts) {
                front = new Front();
                front.setOpen(true);
                model.pinnedFront(front);
                model.fronts.unshift(front);
            } else {
                window.alert('The maximum number of fronts (' + vars.CONST.maxFronts + ') has been exceeded. Please delete one first, by removing all its collections.');
            }
        };

        model.openFront = function(front) {
            _.each(model.fronts(), function(f){
                f.setOpen(f === front, false);
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
                    bootstrap({ force: true })
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
                    .filter(function(collection) { return collection.parents().length > 0; })
                    .reduce(function(collections, collection) {
                        collections[collection.id] =
                           _.reduce(collection.meta, function(acc, val, key) {
                                var v = _.isFunction(val) ? val() : val;
                                if(v) {
                                    acc[key] = v;
                                }
                                return acc;
                            }, {});
                        return collections;
                    }, {})
                    .value()
            };
        }

        function containerUsage() {
            return _.reduce(model.collections(), function(m, col) {
                var type = col.meta.type();

                if (type) {
                    m[type] = _.uniq((m[type] || []).concat(
                        _.map(col.parents(), function(front) { return front.id(); })
                    ));
                }
                return m;
            }, {});
        }

        function bootstrap(opts) {
            return fetchSettings(function (config, switches) {
                if (switches['facia-tool-configuration-disable']) {
                    terminate('The configuration tool has been switched off.', '/');
                    return;
                }
                model.switches(switches);

                if (opts.force || !_.isEqual(config, vars.state.config)) {
                    vars.state.config = config;

                    model.collections(
                       _.chain(config.collections)
                        .map(function(obj, cid) { return new Collection(cloneWithKey(obj, cid)); })
                        .sortBy(function(collection) { return collection.meta.displayName(); })
                        .value()
                    );

                    model.fronts(
                       _.chain(_.keys(config.fronts))
                        .sortBy(function(id) { return id; })
                        .without(model.pinnedFront() ? model.pinnedFront().id() : undefined)
                        .unshift(model.pinnedFront() ? model.pinnedFront().id() : undefined)
                        .filter(function(id) { return id; })
                        .map(function(id) {
                            var newFront = new Front(cloneWithKey(config.fronts[id], id)),
                                oldFront = findFirstById(model.fronts, id);

                            if (oldFront) {
                                newFront.state.isOpen(oldFront.state.isOpen());
                                newFront.state.isOpenProps(oldFront.state.isOpenProps());
                            }

                            return newFront;
                        })
                       .value()
                    );

                    window.console.log('CONTAINER USAGE\n');
                    _.each(containerUsage(), function(fronts, type) {
                        window.console.log(type + ': ' + fronts.join(',') + '\n');
                    });
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