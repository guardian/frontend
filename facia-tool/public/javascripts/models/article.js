define([
    'models/common',
    'knockout',
    'Reqwest',
    'js!humanizedTimeSpan'
],
function (
    common,
    ko,
    reqwest
){
    var absUrlHost = 'http://m.guardian.co.uk/';

    function Article(opts) {
        var opts = opts || {};

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
            'totalHits',
            'pageViewsSeries']);

        // Computeds
        this.humanDate = ko.computed(function(){
            return this.meta.webPublicationDate() ? humanized_time_span(this.meta.webPublicationDate()) : '&nbsp;';
        }, this);
        this.totalHitsFormatted = ko.computed(function(){
            return common.util.numberWithCommas(this.state.totalHits());
        }, this);

        this.populate(opts);
    };

    Article.prototype.populate = function(opts) {
        common.util.populateObservables(this.meta, opts)
        common.util.populateObservables(this.fields, opts.fields)
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
            url: common.config.apiBase + '/collection/' + listId + '/' + this.meta.id(),
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

    return Article;
});
