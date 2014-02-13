/* global _: true, humanized_time_span: true */
define([
    'knockout',
    'modules/vars',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/guid'
], function(
    ko,
    vars,
    asObservableProps,
    populateObservables,
    guid
) {
    function Collection(opts) {
        opts = opts || {};

        this.id = opts.id || guid();

        this.parents = ko.observableArray();

        this.meta   = asObservableProps([
            'displayName',
            'href',
            'groups',
            'tone',
            'uneditable',
            'apiQuery']);

        populateObservables(this.meta, opts);

        if (_.isArray(this.meta.groups())) {
            this.meta.groups(this.meta.groups().join(','));
        }

        this.state = asObservableProps([
            'open',
            'openAdvanced',
            'underHover',
            'underDrag']);
    }

    Collection.prototype.toggleOpen = function() {
        this.state.open(!this.state.open());
        this.state.openAdvanced(this.state.open() && this.state.openAdvanced());
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
        vars.model.save();
    };

    Collection.prototype.discard = function() {
        vars.model.collections.remove(this);
        vars.model.save();
    };

    return Collection;
});
