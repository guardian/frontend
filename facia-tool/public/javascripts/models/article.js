define([
    'modules/vars',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/number-with-commas',
    'modules/authed-ajax',
    'knockout',
    'js!humanized-time-span'
],
function (
    vars,
    asObservableProps,
    populateObservables,
    numberWithCommas,
    authedAjax,
    ko
){
    var absUrlHost = 'http://m.guardian.co.uk/';

    function Article(opts, collection) {
        var opts = opts || {};

        this.collection = collection;

        this.props = asObservableProps([
            'id',
            'webPublicationDate']);

        this.fields = asObservableProps([
            'headline',
            'thumbnail',
            'trailText',
            'shortId']);

        this.fields.headline('...');

        this.meta = asObservableProps([
            'headline',
            'group']);

        this.state = asObservableProps([
            'underDrag',
            'editingTitle',
            'shares',
            'comments',
            'totalHits',
            'pageViewsSeries']);

        // Computeds
        this.humanDate = ko.computed(function(){
            return this.props.webPublicationDate() ? humanized_time_span(this.props.webPublicationDate()) : '';
        }, this);

        this.totalHitsFormatted = ko.computed(function(){
            return numberWithCommas(this.state.totalHits());
        }, this);

        this.headlineInput = ko.computed({
            read: function() {
                return this.meta.headline() || this.fields.headline();
            },
            write: function(value) {
                this.meta.headline(value);
            },
            owner: this
        });

        this.provisionalHeadline = null;

        this.populate(opts);
    };

    Article.prototype.populate = function(opts) {
        populateObservables(this.props, opts);
        populateObservables(this.meta, opts.meta);
        populateObservables(this.fields, opts.fields);
    };

    Article.prototype.startTitleEdit = function() {
        this.provisionalHeadline = this.meta.headline();
        this.state.editingTitle(true);
    };

    Article.prototype.saveTitleEdit = function() {
        if(this.meta.headline()) {
            this.save();
        };
        this.state.editingTitle(false);
    };

    Article.prototype.cancelTitleEdit = function() {
        this.meta.headline(this.provisionalHeadline);
        this.state.editingTitle(false);
    };

    Article.prototype.revertTitleEdit = function() {
        this.meta.headline(undefined);
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
                live:     vars.state.liveMode(),
                draft:   !vars.state.liveMode(),
            }
        );
        this.collection.state.loadIsPending(true)
    };

    return Article;
});
