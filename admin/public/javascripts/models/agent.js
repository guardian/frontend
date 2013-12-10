define(['models/editable', 'knockout', 'Common'], function (Editable,  ko, Common) {

    var Agent = function(opts) {

        var opts = opts || {},
            importanceBumped  = 100,
            importanceDefault = 50,
            self = this;

        this.id         = ko.observable(opts.id);
        this.name       = ko.observable(opts.name);
        this.explainer  = ko.observable(opts.explainer);
        this.importance = ko.observable(opts.importance);
        this.role       = ko.observable(opts.role); // Eg, 'Barrister, and inquiry Chairman'
        this.picture    = ko.observable(opts.picture);
        this.url        = ko.observable(opts.url);
        this.rdfType    = opts.rdfType || 'http://schema.org/Person';

        // Track for editability / saving
        this._makeEditable(['name', 'explainer', 'importance', 'role', 'picture', 'url']);

        this.bump = function() {
            self.importance(self.importance() === importanceBumped ? importanceDefault : importanceBumped);
        };
    };

    Agent.prototype = new Editable();

    return Agent;
});
