import ko from 'knockout';
import _ from 'underscore';
import * as vars from 'modules/vars';
import listManager from 'modules/list-manager';
import droppable from 'modules/droppable';
import updateScrollables from 'utils/update-scrollables';
import cloneWithKey from 'utils/clone-with-key';
import findFirstById from 'utils/find-first-by-id';
import Group from 'models/group';
import Front from 'models/config/front';
import Collection from 'models/config/collection';
import newItems from 'models/config/new-items';
import persistence from 'models/config/persistence';
import frontCount from 'utils/front-count';

export default function() {
    var model = {};
    vars.setModel(model);

    model.title = ko.observable((vars.priority || vars.CONST.defaultPriority) + ' fronts configuration');

    model.switches = ko.observable();

    model.navSections = [];

    model.collectionsMap = {};
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
        var front, num = frontCount(vars.state.config.fronts, vars.priority);

        if (num.count < num.max) {
            front = new Front({priority: vars.priority, isHidden: true});
            front.setOpen(true);
            model.pinnedFront(front);
            model.fronts.unshift(front);
        } else {
            window.alert('The maximum number of fronts (' + num.max + ') has been exceeded. Please delete one first, by removing all its collections.');
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

    this.update = function (res) {
        this.refreshConfig(res.config);
    };

    this.refreshConfig = function (config) {
        model.collectionsMap = {};
        var sortedCollections = _.chain(config.collections)
            .map(function(obj, cid) {
                var collection = new Collection(cloneWithKey(obj, cid));
                model.collectionsMap[cid] = collection;
                return collection;
            })
            .sortBy(function(collection) { return collection.meta.displayName(); })
            .value();

        model.collections(sortedCollections);

        model.fronts(
           _.chain(_.keys(config.fronts))
            .filter(function(id) { return vars.priority === config.fronts[id].priority; })
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
    };

    this.init = function (bootstrap, res) {
        var onload = _.bind(function (res) {
            this.refreshConfig(res.config);
            vars.model.pending(false);
        }, this);
        persistence.registerCallback(function () {
            bootstrap.get().onload(onload);
        });

        listManager.init(newItems);
        droppable.init();

        this.update(res);
        model.navSections = [].concat(vars.pageConfig.navSections);

        ko.applyBindings(model);

        updateScrollables();
        window.onresize = updateScrollables;
    };
}
