/* global _: true, humanized_time_span: true */
define([
    'config',
    'modules/vars',
    'models/group',
    'models/config/collection',
    'utils/as-observable-props',
    'utils/find-first-by-id'
], function(
    config,
    vars,
    Group,
    Collection,
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

        this.group.items(
           _.chain(opts.collections)
            .map(function(id) {
                return findFirstById(vars.model.collections, id);
            })
            .filter(function(collection) { return !!collection; })
            .value()
        );
    }

    Front.prototype.toggleOpen = function() {
        this.state.open(!this.state.open());
    };

    Front.prototype.createCollection = function() {
        var collection = new Collection({
            id: this.id + '/' + this.group.items().length,
            roleName: 'Untitled collection'
        });
        collection.toggleOpen();
        this.group.items.push(collection);
    };

    return Front;
});
