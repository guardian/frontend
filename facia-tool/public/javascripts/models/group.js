define([
    'knockout'
], function(
    ko
) {
    function Group(opts) {
        opts = opts || {};

        this.items =      ko.observableArray(_.isArray(opts.items) ? opts.items : []);

        this.underDrag =  ko.observable();

        this.group =      opts.group;
        this.name =       opts.name;
        this.collection = opts.collection;
        this.keepCopy =   opts.keepCopy;

        this.dropItem =   opts.dropItem  || function(){};
        this.callback =   opts.callback  || function(){};
    }

    return Group;
});
