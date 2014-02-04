/* global _: true, humanized_time_span: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'models/group',
    'utils/as-observable-props'
], function(
    config,
    ko,
    vars,
    Group,
    asObservableProps
) {
    function Front(opts) {
        var self = this;

        if (!opts || !opts.id) { return; }

        this.id = opts.id;

        this.state  = asObservableProps([
            'open']);

        this.group = new Group({});

        this.group.items(
            _.map(opts.collections, function(id) { return {id: id}; })
        );
    }

    Front.prototype.toggleOpen = function() {
        this.state.open(!this.state.open());
    };

    return Front;
});
