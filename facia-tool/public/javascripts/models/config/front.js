/* global _: true, humanized_time_span: true */
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

        this.state  = asObservableProps([
            'open']);

        this.group = new Group({
            parent: self,
            parentType: 'Front'
        });

        this.group.items(
           _.chain(opts.collections)
            .map(function(id) {return findFirstById(vars.model.collections, id); })
            .filter(function(collection) { return !!collection; })
            .map(function(collection) {
                collection.parents.push(self);
                return collection;
            })
            .value()
        );

        this.depopulateCollection = self._depopulateCollection.bind(self);
    }

    Front.prototype.toggleOpen = function() {
        this.state.open(!this.state.open());
    };

    Front.prototype.createCollection = function() {
        var collection = new Collection({idPrefix: this.id()});
        collection.toggleOpen();
        collection.parents.push(this);
        this.group.items.push(collection);
        vars.model.collections.unshift(collection);
    };

    Front.prototype._depopulateCollection = function(collection) {
        collection.parents.remove(this);
        this.group.items.remove(collection);
        vars.model.save();
    };

    Front.prototype.save = function() {
        vars.model.save();
    };

    return Front;
});
