define([
    'knockout',
    'underscore',
    'modules/vars',
    'modules/list-manager',
    'modules/droppable',
    'utils/update-scrollables',
    'utils/clone-with-key',
    'utils/find-first-by-id',
    'utils/logger',
    'models/group',
    'models/config/front',
    'models/config/collection',
    'models/config/new-items',
    'models/config/persistence'
], function(
    ko,
    _,
    vars,
    listManager,
    droppable,
    updateScrollables,
    cloneWithKey,
    findFirstById,
    logger,
    Group,
    Front,
    Collection,
    newItems,
    persistence
) {
    return function() {
        var model = vars.model = {};

        model.title = ko.observable((vars.priority || 'editorial') + ' fronts configuration');

        model.switches = ko.observable();

        model.navSections = [];

        model.collections = ko.observableArray();

        model.fronts = ko.observableArray();

        model.pinnedFront = ko.observable();

        model.pending = ko.observable();

        model.types =  _.pluck(vars.CONST.types, 'name');

        model.clipboard = new Group({
            parentType: 'Clipboard',
            keepCopy:  true
        });

        model.createFront = function() {
            var front;

            if (vars.model.fronts().length <= vars.CONST.maxFronts) {
                front = new Front({priority: vars.priority, isHidden: true});
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

        this.update = function (res) {
            var config = res.config,
                switches = res.switches;

            model.switches(switches);

            if (!_.isEqual(config, vars.state.config)) {
                this.refreshConfig(config);
            }
        };

        this.refreshConfig = function (config) {
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

            logger.log('CONTAINER USAGE\n');
            _.each(containerUsage(), function(fronts, type) {
                logger.log(type + ': ' + fronts.join(',') + '\n');
            });
        };

        this.init = function (bootstrap, res) {
            var that = this;
            persistence.registerCallback(function () {
                bootstrap.get().onload(function (res) {
                    that.refreshConfig(res.config);
                    vars.model.pending(false);
                });
            });

            listManager.init(newItems);
            droppable.init();

            this.update(res);

            model.navSections = [].concat(vars.pageConfig.navSections);

            ko.applyBindings(model);

            updateScrollables();
            window.onresize = updateScrollables;
        };
    };
});
