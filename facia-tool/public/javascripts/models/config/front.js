/* global _: true */
define([
    'knockout',
    'config',
    'modules/vars',
    'models/group',
    'models/config/collection',
    'utils/as-observable-props',
    'utils/find-first-by-id'
], function(
    ko,
    config,
    vars,
    Group,
    Collection,
    asObservableProps,
    findFirstById
) {
    function Front(opts) {
        var self = this;

        opts = opts || {};

        this.id = ko.observable(opts.id);

        this.id.subscribe(function(id) {
            id = id || '';
            id = id.toLowerCase();
            id = id.replace(/^\/|\/$/g, '');
            id = id.replace(/[^a-z0-9\/\-]*/g, '');
            self.id(id);
            if(_.filter(vars.model.fronts(), function(front) { return front.id() === id; }).length > 1) {
                self.id(undefined);
            }
        });

        this.state  = asObservableProps([
            'open']);

        this.collections = new Group({
            parent: self,
            parentType: 'Front',
            items:
               _.chain(opts.collections)
                .map(function(id) {return findFirstById(vars.model.collections, id); })
                .filter(function(collection) { return !!collection; })
                .map(function(collection) {
                    collection.parents.push(self);
                    return collection;
                })
                .value()
        });

        this.depopulateCollection = this._depopulateCollection.bind(this);
    }

    Front.prototype.setOpen = function(isOpen) {
        this.state.open(isOpen);
    };

    Front.prototype.toggleOpen = function() {
        this.state.open(!this.state.open());
    };

    Front.prototype.createCollection = function() {
        var collection = new Collection();

        collection.toggleOpen();
        collection.parents.push(this);
        this.collections.items.push(collection);
        vars.model.collections.unshift(collection);
    };

    Front.prototype._depopulateCollection = function(collection) {
        collection.state.open(false);
        collection.parents.remove(this);
        this.collections.items.remove(collection);
        vars.model.save(collection);
    };

    return Front;
});
