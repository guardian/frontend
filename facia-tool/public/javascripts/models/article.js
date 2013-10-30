define([
    'models/common',
    'models/humanizedTimeSpan',
    'models/authedAjax',
    'knockout'
],
function (
    common,
    humanizedTimeSpan,
    authedAjax,
    ko
){
    var absUrlHost = 'http://m.guardian.co.uk/';

    function Article(opts, collection) {
        var opts = opts || {};

        this.collection = collection;

        this.props = common.util.asObservableProps([
            'id',
            'webTitle',
            'webPublicationDate']);

        this.fields = common.util.asObservableProps([
            'thumbnail',
            'trailText',
            'shortId']);

        this.meta = common.util.asObservableProps([
            'group',
            'webTitle']);

        this.state = common.util.asObservableProps([
            'underDrag',
            'editingTitle',
            'shares',
            'comments',
            'totalHits',
            'pageViewsSeries']);

        // Computeds
        this.humanDate = ko.computed(function(){
            return this.props.webPublicationDate() ? humanizedTimeSpan(this.props.webPublicationDate()) : '&nbsp;';
        }, this);
        
        this.totalHitsFormatted = ko.computed(function(){
            return common.util.numberWithCommas(this.state.totalHits());
        }, this);

        this.webTitleInput = ko.computed({
            read: function() {
                return this.meta.webTitle() || this.props.webTitle();
            },
            write: function(value) {
                this.meta.webTitle(value);
            },
            owner: this
         });

        this.populate(opts);
    };

    Article.prototype.populate = function(opts) {
        common.util.populateObservables(this.props, opts);
        common.util.populateObservables(this.meta, opts.meta);
        common.util.populateObservables(this.fields, opts.fields);
    };

    Article.prototype.startTitleEdit = function() {
        if (!this.collection) { return; }

        this.provisionalWebTitle = this.meta.webTitle();
        this.state.editingTitle(true);
    };

    Article.prototype.saveTitleEdit = function() {
        if(this.meta.webTitle()) {
            this.save();
        };
        this.state.editingTitle(false);
    };

    Article.prototype.cancelTitleEdit = function() {
        this.meta.webTitle(this.provisionalWebTitle);
        this.state.editingTitle(false);
    };

    Article.prototype.revertTitleEdit = function() {
        this.meta.webTitle(undefined);
        this.state.editingTitle(false);
        this.save();
    };

    Article.prototype.getMeta = function() {
        var self = this;

        return _.chain(this.meta)
            .pairs()
            // is the meta property a not a whitespace-only string ?
            .filter(function(p){ return !_.isUndefined(p[1]()) && ("" + p[1]()).replace(/\s*/g, '').length > 0; })
            // does it actually differ from the props value (if any) that it's overwriting ?
            .filter(function(p){ return  _.isUndefined(self.props[p[0]]) || self.props[p[0]]() !== p[1](); })
            .map(function(p){ return [p[0], p[1]()]; })
            .object()
            .value();
    };

    Article.prototype.save = function() {
        if (!this.collection) { return; }

        authedAjax.updateCollection(
            'post',
            this.collection,
            {
                item:     this.props.id(),
                position: this.props.id(),
                itemMeta: this.getMeta(),
                live:     common.state.liveMode(),
                draft:   !common.state.liveMode(),
            }
        );
        this.collection.state.loadIsPending(true)
    };

    return Article;
});
