define([
    'models/editable',
    'models/quote',
    'knockout',
    'Common',
    'Reqwest'
], 
function (
    Editable,
    Quote,
    ko,
    Common,
    Reqwest
){

    var mDotHost = 'http://m.guardian.co.uk/';

    var Article = function(opts) {

        var opts = opts || {},
            self = this;

        this.id         = ko.observable(opts.id || '');
        this.shortId    = ko.observable(opts.shortId || '');
        this.webTitle   = ko.observable(opts.webTitle || '');
        this.webPublicationDate = ko.observable(opts.webPublicationDate);
        this.importance = ko.observable(opts.importance || 50);
        this.colour     = ko.observable(opts.colour);
        this.headlineOverride   = ko.observable(opts.headline);

        if (opts.fields) {
            this.trailText  = ko.observable(opts.fields.trailText || '');
        }

        this.quote  = ko.observable(opts.quote ? new Quote(opts.quote) : '');

        // Performance stats
        this.shares          = ko.observable(opts.shares);
        this.comments        = ko.observable(opts.comments);

        // Temp vars
        this._mDot      = ko.observable(mDotHost + opts.id || '');    
        this._humanDate = ko.computed(function(){
            return this.webPublicationDate() ? humanized_time_span(this.webPublicationDate()) : '-';
        }, this);

        // colour is represented as a number at the moment
        this._colourAsText = ko.computed(function() {
            switch (this.colour()) {
                case 1: return 'Overview';
                case 2: return 'Background';
                case 3: return 'Analysis';
                case 4: return 'Reaction';
                case 5: return 'Light';
                case 0: return '';
            }
        }, this);

        // Track for editability / saving
        this._makeEditable(['importance', 'colour', 'headlineOverride']);
    };

    Article.prototype = new Editable();

    Article.prototype.addPerformanceCounts = function() {
        this.addSharedCount();
        this.addCommentCount();
    }

    Article.prototype.addSharedCount = function() {
        var url = encodeURIComponent('http://api.sharedcount.com/?url=http://www.guardian.co.uk/' + this.id()),
            self = this;
        Reqwest({
            url: '/json/proxy/' + url,
            type: 'json',
            success: function(resp) {
                self.shares(self.sumNumericProps(resp));
                Common.mediator.emitEvent('models:story:haschanges');
            },
            complete: function() {
                Common.mediator.emitEvent('models:article:performance:done');                
            }
        });
    };

    Article.prototype.addCommentCount = function() {
        var url = encodeURIComponent('http://discussion.guardianapis.com/discussion-api/discussion/p/' + 
            this.shortId() + '/comments/count'),
            self = this;
        if(this.shortId()) {
            Reqwest({
                url: '/json/proxy/' + url,
                type: 'json',
                success: function(resp) {
                    self.comments(resp.numberOfComments);
                    Common.mediator.emitEvent('models:story:haschanges');
                },
                complete: function() {
                    Common.mediator.emitEvent('models:article:performance:done');                
                }
            });            
        } else {
            Common.mediator.emitEvent('models:article:performance:done');                
        }    
    };

    Article.prototype.sumNumericProps = function sumNumericProps(obj) {
        var self = this;
        return _.reduce(obj, function(sum, p){
            if (typeof p === 'object' && p) {
                return sum + self.sumNumericProps(p);
            } else {
                return sum + (typeof p === 'number' ? p : 0);
            }
        }, 0);
    };

    Article.prototype.setColour = function(item, e) {
        var colour = parseInt($(e.target).data('tone') || 0, 10);
        this.colour(colour === item.colour() ? 0 : colour);
    };

    Article.prototype.addQuote = function() {
        this.quote(new Quote());
    };
    
    Article.prototype.deleteQuote = function() {
        if (!window.confirm("Are you sure you want to DELETE the quote?")) return;
        this.quote(undefined);
        Common.mediator.emitEvent('models:story:haschanges');
    };

    Article.prototype.addHeadlineOverride = function() {
        var h = window.prompt("Enter the headline:");
        this.headlineOverride(h);
    };
    
    Article.prototype.deleteHeadlineOverride = function() {
        if (!window.confirm("Are you sure you want to DELETE the headline?")) return;
        this.headlineOverride(undefined);
        Common.mediator.emitEvent('models:story:haschanges');
    };

    return Article;
});
