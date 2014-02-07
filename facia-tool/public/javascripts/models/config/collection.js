/* global _: true, humanized_time_span: true */
define([
    'knockout',
    'modules/vars',
    'utils/as-observable-props',
    'utils/populate-observables'
], function(
    ko,
    vars,
    asObservableProps,
    populateObservables
) {
    function Collection(opts) {
        if (!opts || !opts.id) { return; }

        this.id = opts.id;
        this.parents = ko.observableArray();

        this.meta   = asObservableProps([
            'roleName',
            'displayName',
            'href',
            'groups',
            'tone',
            'uneditable']);

        populateObservables(this.meta, opts);

        this.state = asObservableProps([
            'open',
            'underDrag']);
    }

    Collection.prototype.toggleOpen = function() {
        this.state.open(!this.state.open());
    };

    Collection.prototype.save = function() {
        if (vars.model.collections.indexOf(this) < 0) {
            vars.model.collections.unshift(this);
        }
        this.state.open(false);
    };

    return Collection;
});
