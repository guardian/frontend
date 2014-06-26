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
    'models/config/collection',
    'models/config/persistence'
], function(
    pageConfig,
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
    Collection,
    persistence
) {
    return function() {
        var model = vars.model = {};

        model.switches = ko.observable();

        model.navSections = [].concat(pageConfig.navSections);

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
                front = new Front({priority: vars.priority});
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

            persistence.registerCallback(function () {
                bootstrap({
                    force: true
                }).done(function () {
                    vars.model.pending(false);
                });
            });

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