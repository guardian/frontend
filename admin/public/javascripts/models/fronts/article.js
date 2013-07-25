define([
    'models/fronts/editable',
    'knockout',
    'Common',
    'Reqwest',
    'js!humanizedTimeSpan'
], 
function (
    Editable,
    ko,
    Common,
    Reqwest
){
    var absUrlHost = 'http://m.guardian.co.uk/';

    function Article(opts) {
        this.id                 = ko.observable();
        this.webTitle           = ko.observable();
        this.webPublicationDate = ko.observable();
        this.thumbnail          = ko.observable();
        this.trailText          = ko.observable();
        this.shortId            = ko.observable();

        // Performance stats
        this.shares             = ko.observable();
        this.comments           = ko.observable();

        // Temp vars
        this._absUrl            = ko.observable();

        // Computeds
        this._humanDate = ko.computed(function(){
            return this.webPublicationDate() ? humanized_time_span(this.webPublicationDate()) : '&nbsp;';
        }, this);

        // Track for editability / saving
        this._makeEditable(['webTitle', 'trailText']);

        this.init(opts);
    };

    Article.prototype = new Editable();

    Article.prototype.init = function(opts) {
        var opts = opts || {},
            self = this;

        this.id(opts.id || '');
        this.webTitle(opts.webTitle || '');
        this.webPublicationDate(opts.webPublicationDate);

        if (opts.fields) {
            this.thumbnail(opts.fields.thumbnail);
            this.trailText(opts.fields.trailText);
            this.shortId(opts.fields.shortUrl.match(/[^\/]+$/)[0]);
        }

        this.shares(opts.shares);
        this.comments(opts.comments);

        this._absUrl(absUrlHost + opts.id);    

        // Performance counts are awaiting a fix to the proxy API endpoint 
        //this.addPerformanceCounts();
    }

    Article.prototype.addPerformanceCounts = function() {
        this.addSharedCount();
        this.addCommentCount();
    }

    Article.prototype.addSharedCount = function() {
        var url = 'http://api.sharedcount.com/?url=http://www.guardian.co.uk/' + this.id(),
            self = this;
        Reqwest({
            url: '/json/proxy/' + url,
            type: 'json',
            success: function(resp) {
                self.shares(self.sumNumericProps(resp));
            },
            complete: function() {
            }
        });
    };

    Article.prototype.addCommentCount = function() {
        var url = 'http://discussion.guardianapis.com/discussion-api/discussion/p/' + 
            this.shortId() + '/comments/count',
            self = this;
        if(this.shortId()) {
            Reqwest({
                url: '/json/proxy/' + url,
                type: 'json',
                success: function(resp) {
                    self.comments(resp.numberOfComments);
                },
                complete: function() {
                }
            });            
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

    return Article;
});
