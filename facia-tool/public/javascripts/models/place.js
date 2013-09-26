define(['models/editable', 'knockout', 'Common'], function (Editable,  ko, Common) {

    var Place = function(opts) {

        var opts = opts || {};

        this.id         = ko.observable(opts.id || '');
        this.name       = ko.observable(opts.name || '');

        this._makeEditable(['name']);

    };

    Place.prototype = new Editable();
    
    return Place;
})
