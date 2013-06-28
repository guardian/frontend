define(['models/editable', 'knockout', 'Common'], function (Editable, ko, Common) {

    var Quote = function(opts) {

        var opts = opts || {},
            self = this;

        this.text    = ko.observable(opts.text    || '');
        this.by      = ko.observable(opts.by      || '');
        this.url     = ko.observable(opts.url     || '');
        this.subject = ko.observable(opts.subject || '');        

        // Track for editability / saving
        this._makeEditable(['text', 'by', 'url', 'subject']);
    };

    Quote.prototype = new Editable();

    return Quote;
});
