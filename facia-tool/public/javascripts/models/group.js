/* global _: true */
define([
    'knockout'
], function(
    ko
) {
    function Group(opts) {
        var self = this;

        opts = opts || {};

        this.items =      ko.observableArray(_.isArray(opts.items) ? opts.items : []);

        this.underDrag =  ko.observable();

        this.group =      opts.group;
        this.name =       opts.name;
        this.collection = opts.collection;
        this.keepCopy =   opts.keepCopy;

        this.reflow = opts.reflow  || function() {};

        this.dropItem =   opts.dropItem || function(item) {
            self.items.remove(item);
            self.reflow();
        };
    }

    return Group;
});
