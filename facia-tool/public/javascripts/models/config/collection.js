/* global _: true, humanized_time_span: true */
define([
    'utils/as-observable-props',
    'utils/populate-observables'
], function(
    asObservableProps,
    populateObservables
    ) {
    function Collection(opts) {
        if (!opts || !opts.id) { return; }

        this.id = opts.id;

        // properties from the config, about this collection
        this.configMeta   = asObservableProps([
            'displayName',
            'roleName',
            'uneditable',
            'groups',
            'tone']);
        populateObservables(this.configMeta, opts);

        this.state = asObservableProps([
            'underDrag']);
    }

    Collection.prototype.open = function(e) {
        e.preventDefault();
    };

    return Collection;
});
