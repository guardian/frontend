define([
    'models/editable',
    'Knockout',
    'Common',
    'Reqwest'
], 
function (
    Editable,
    ko,
    Common,
    Reqwest
){

    var absUrlHost = 'http://m.guardian.co.uk/';

    var Article = function(opts) {

        var opts = opts || {},
            self = this;

        this.id         = ko.observable(opts.id || '');
        this.shortId    = ko.observable(opts.shortId || '');
        this.webTitle   = ko.observable(opts.webTitle || '');
        this.webPublicationDate = ko.observable(opts.webPublicationDate);
        this.headlineOverride   = ko.observable(opts.headline);

        if (opts.fields) {
            this.trailText  = ko.observable(opts.fields.trailText || '');
        }

        // Performance stats
        this.shares          = ko.observable(opts.shares);
        this.comments        = ko.observable(opts.comments);

        // Temp vars
        this._absUrl      = ko.observable(absUrlHost + opts.id || '');    
        this._humanDate = ko.computed(function(){
            return this.webPublicationDate() || '-';
            //return this.webPublicationDate() ? humanized_time_span(this.webPublicationDate()) : '-';
        }, this);

        // Track for editability / saving
        this._makeEditable(['headlineOverride']);
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
