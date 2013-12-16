/* global _: true */
define([
    'knockout'
], function(
    ko
) {
    function Group(opts) {
        var self = this;

        opts = opts || {};

        this.items = ko.observableArray(opts.items);

        this.underDrag =  ko.observable();

        this.group =      opts.group;
        this.name =       opts.name;
        this.collection = opts.collection;
        this.article =    opts.article;
        this.keepCopy =   opts.keepCopy;

        this.reflow = opts.reflow  || function() {};

        this.dropItem = function(item) {
            self.items.remove(item);
            self.reflow();
            if (_.isFunction(opts.dropItem)) { opts.dropItem(item); }
        };
    }

    return Group;
});
