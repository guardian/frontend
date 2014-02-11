/* global _: true, humanized_time_span: true */
define([
    'config',
    'modules/vars',
    'models/group',
    'models/config/collection',
    'utils/guid',
    'utils/as-observable-props',
    'utils/find-first-by-id'
], function(
    config,
    vars,
    Group,
    Collection,
    guid,
    asObservableProps,
    findFirstById
) {
    function Front(opts) {
        var self = this;

        if (!opts || !opts.id) { return; }

        this.id = opts.id;

        this.state  = asObservableProps([
            'open']);

        this.group = new Group({
            parent: self,
            parentType: 'Front'
        });
    }

    Front.prototype.populate = function(collectionIds, collections) {
        this.group.items(
           _.chain(collectionIds)
            .map(function(id) {return findFirstById(collections, id); })
            .filter(function(collection) { return collection; })
            .value()
        );
    };

    Front.prototype.toggleOpen = function() {
        this.state.open(!this.state.open());
    };

    Front.prototype.createCollection = function() {
        var collection = new Collection({
            id: this.id + '/' + guid()
        });
        collection.toggleOpen();
        collection.parents.push(this);
        this.group.items.push(collection);
    };

    return Front;
});
