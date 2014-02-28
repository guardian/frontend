/* global _: true */
define([
    'knockout'
], function(
    ko
) {
    function Group(opts) {
        var self = this;

        opts = opts || {};

        this.items = ko.isObservable(opts.items) && opts.items.push ? opts.items : ko.observableArray(opts.items);

        this.underDrag  = ko.observable();
        this.group      = opts.group || 0;
        this.name       = opts.name || '';

        this.parent     = opts.parent;
        this.parentType = opts.parentType;

        this.keepCopy   = opts.keepCopy;
        this.reflow     = opts.reflow  || function() {};

        this.omitItem   = function(item) {
            self.items.remove(item);
            self.reflow();
            if (_.isFunction(opts.omitItem)) { opts.omitItem(item); }
        };
    }

    return Group;
});
