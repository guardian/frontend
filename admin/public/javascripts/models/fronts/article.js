define([
    'models/fronts/common',
    'models/fronts/editable',
    'knockout',
    'Reqwest',
    'js!humanizedTimeSpan'
], 
function (
    common,
    Editable,
    ko,
    reqwest
){
    var absUrlHost = 'http://m.guardian.co.uk/';

    function Article(opts) {

        this.meta = common.util.asObservableProps([
            'id',
            'webTitle',
            'webPublicationDate']);

        this.fields = common.util.asObservableProps([
            'thumbnail',
            'trailText',
            'shortId']);

        this.config = common.util.asObservableProps([
            'webTitle']);

        this.state = common.util.asObservableProps([
            'editingConfig',
            'shares',
            'comments',
            'pageViews',
            'pageViewsSeries']);

        // Computeds
        this.humanDate = ko.computed(function(){
            return this.meta.webPublicationDate() ? humanized_time_span(this.meta.webPublicationDate()) : '&nbsp;';
        }, this);

        this.init(opts);
    };

    Article.prototype.init = function(opts) {
        var opts = opts || {};
        common.util.populateObservables(this.meta, opts)
        common.util.populateObservables(this.fields, opts.fields)

        if (opts.index < 3) {
            this.addPageViews();
        }
    }

    Article.prototype.toggleEditingConfig = function() {
        this.state.editingConfig(!this.state.editingConfig());
    }

    Article.prototype.stopEditingConfig = function() {
        this.state.editingConfig(false);
    }

    Article.prototype.saveConfig = function(listId) {
        var self = this;
        // If a config property (a) is set and (b) differs from the meta value, include it in post.
        reqwest({
            url: common.config.apiBase + '/' + listId + '/' + this.meta.id(),
            method: 'post',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                config: _.chain(this.config)
                        .pairs()
                        .filter(function(p){ return p[1]() && p[1]() !== self.meta[p[0]](); })
                        .map(function(p){ return [p[0], p[1]()]; })
                        .object()
                        .value()
            })
        }).always(function(){
            self.stopEditingConfig();
        });
    }

    Article.prototype.addPageViews = function() {
        var self = this;
        // If a config property (a) is set and (b) differs from the meta value, include it in post.
        reqwest({
            url: 'http://dashboard.ophan.co.uk/graph/breakdown/data?path=' + encodeURIComponent('/' + this.meta.id()),
            type: 'jsonp'
        }).then(
            function (resp) {
                if(resp.totalHits) {
                    self.state.pageViews(resp.totalHits);
                }
                if(resp.seriesData && resp.seriesData[0] && resp.seriesData[0].data) {
                    self.state.pageViewsSeries(_.pluck(resp.seriesData[0].data, 'y'));
                }
            },
            function (xhr) {}
        );

    }

    Article.prototype.addPerformanceCounts = function() {
        this.addSharedCount();
        this.addCommentCount();
    }

    Article.prototype.addSharedCount = function() {
        var url = 'http://api.sharedcount.com/?url=http://www.guardian.co.uk/' + this.id(),
            self = this;
        reqwest({
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
            reqwest({
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
