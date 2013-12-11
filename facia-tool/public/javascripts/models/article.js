/* global _: true, humanized_time_span: true */
define([
    'modules/vars',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/number-with-commas',
    'models/group',
    'modules/authed-ajax',
    'knockout',
    'js!humanized-time-span'
],
    function (
        vars,
        asObservableProps,
        numberWithCommas,
        populateObservables,
        Group,
        authedAjax,
        ko
        ){
        function Article(options, collection) {
            var opts = options || {};

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
                'sublinks',
                'headline',
                'group']);


            this.state = asObservableProps([
                'underDrag',
                'editingMeta',
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
        }

        Article.prototype.populate = function(opts) {
            populateObservables(this.props, opts);
            populateObservables(this.meta, opts.meta);
            populateObservables(this.fields, opts.fields);

            this.meta.sublinks = new Group ({
                items: _.map((opts.meta || {}).sublinks, function(sublink) {
                    return new Article(sublink);
                })
            });
        };

        Article.prototype.startMetaEdit = function() {
            this.provisionalHeadline = this.meta.headline();
            this.state.editingMeta(true);
        };

        Article.prototype.saveMetaEdit = function() {
            this.save();
            this.state.editingMeta(false);
        };

        Article.prototype.cancelMetaEdit = function() {
            this.state.editingMeta(false);
            this.collection.load();
        };

        Article.prototype.revertMetaEdit = function() {
            this.meta.headline(undefined);
        };

        Article.prototype.getMeta = function() {
            var self = this,
                result = _.chain(this.meta)
                    .pairs()
                    // do sublinks separately
                    .filter(function(p){ return p[0] !== 'sublinks'; })
                    // is the meta property a not a whitespace-only string ?
                    .filter(function(p){ return !_.isUndefined(p[1]()) && ("" + p[1]()).replace(/\s*/g, '').length > 0; })
                    // does it actually differ from the props value (if any) that it's overwriting ?
                    .filter(function(p){ return  _.isUndefined(self.props[p[0]]) || self.props[p[0]]() !== p[1](); })
                    .map(function(p){ return [p[0], p[1]()]; })
                    .object()
                    .value();

            if (this.meta.sublinks && this.meta.sublinks.items().length) {
                result.sublinks = _.map(this.meta.sublinks.items(), function(sublink) {
                    return {
                        id:   sublink.props.id(),
                        meta: sublink.meta.headline() ? {headline: sublink.meta.headline()} : undefined
                    };
                });
            }

            return result;
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
                    draft:   !vars.state.liveMode()
                }
            );
            this.collection.state.loadIsPending(true);
        };

        return Article;
    });
