/* global _: true, humanized_time_span: true */
define([
    'knockout',
    'modules/vars',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/collection-guid'
], function(
    ko,
    vars,
    asObservableProps,
    populateObservables,
    collectionGuid
) {
    function Collection(opts) {
        opts = opts || {};

        this.id = opts.id || collectionGuid();

        this.parents = ko.observableArray();

        this.meta   = asObservableProps([
            'displayName',
            'href',
            'groups',
            'type',
            'uneditable',
            'apiQuery']);

        populateObservables(this.meta, opts);

        if (_.isArray(this.meta.groups())) {
            this.meta.groups(this.meta.groups().join(','));
        }

        this.state = asObservableProps([
            'enableDiscard',
            'open',
            'openAdvanced',
            'underDrag']);
    }

    Collection.prototype.toggleOpen = function() {
        this.state.open(!this.state.open());
        this.state.openAdvanced(this.state.open() && this.state.openAdvanced());
    };

    Collection.prototype.enableDiscard = function() {
        this.state.enableDiscard(true);
    };

    Collection.prototype.toggleOpenAdvanced = function() {
        this.state.openAdvanced(!this.state.openAdvanced());
    };

    Collection.prototype.save = function() {
        if (vars.model.collections.indexOf(this) < 0) {
            vars.model.collections.unshift(this);
        }
        this.state.open(false);
        this.state.openAdvanced(false);
        vars.model.save(this);
    };

    Collection.prototype.discard = function() {
        if (this.state.enableDiscard()) {
            vars.model.collections.remove(this);
            vars.model.save(this);
        }
    };

    return Collection;
});
