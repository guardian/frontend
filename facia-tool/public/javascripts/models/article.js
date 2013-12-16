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
        populateObservables,
        numberWithCommas,
        Group,
        authedAjax,
        ko
        ){
        function Article(opts) {
            var self = this;

            opts = opts || {};

            this.parentArticle = opts.parentArticle;

            this.collection = opts.collection;

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

            this.populate(opts);
        }

        Article.prototype.populate = function(opts) {
            var self = this;

            populateObservables(this.props,  opts);
            populateObservables(this.meta,   opts.meta);
            populateObservables(this.fields, opts.fields);
            populateObservables(this.state,  opts.state);

            this.meta.sublinks = new Group ({
                items: _.map((opts.meta || {}).sublinks, function(item) {
                    return new Article(_.extend(item, {parentArticle: self}));
                }),
                collection: self.collection,
                article: self
            });
        };

        Article.prototype.startMetaEdit = function() {
            var self = this;
            _.defer(function(){
                self.state.editingMeta(true);
            });
        };

        Article.prototype.stopMetaEdit = function() {
            var self = this;
            _.defer(function(){
                self.state.editingMeta(false);
            });
        };

        Article.prototype.saveMetaEdit = function() {
            var self = this;

            // defer, to let through any UI events, before they're blocked by the loadIsPending CSS:
            setTimeout(function() {
                self.save();
            }, 200);
        };

        Article.prototype.revertHeadline = function() {
            this.meta.headline(undefined);
            this.saveMetaEdit();
        };

        Article.prototype.getMeta = function() {
            var self = this;

            return _.chain(this.meta)
                .pairs()
                // execute any knockout values:
                .map(function(p){ return [p[0], _.isFunction(p[1]) ? p[1]() : p[1]]; })
                // reject undefined properties:
                .filter(function(p){ return !_.isUndefined(p[1]); })
                // reject whitespace-only strings:
                .filter(function(p){ return _.isString(p[1]) ? p[1].replace(/\s*/g, '').length > 0 : true; })
                // reject vals that don't differ from the props (if any) that they're overwriting:
                .filter(function(p){ return _.isUndefined(self.props[p[0]]) || self.props[p[0]]() !== p[1]; })
                // serialise sublinks recursively
                .map(function(p) {
                    if (p[0] === 'sublinks') {
                        return [p[0], _.map(p[1].items(), function(sublink) {
                            return {
                                id:   sublink.props.id(),
                                meta: sublink.getMeta()
                            };
                        })];
                    }
                    return [p[0], p[1]];
                })
                // drop empty arrays (e.g .sublinks):
                .filter(function(p){ return _.isArray(p[1]) ? p[1].length : true; })
                // return as obj, or as undefined if empty.
                // undefined is useful for ommiting it from any subsequent JSON.stringify call 
                .reduce(function(obj, p, key) {
                    obj = obj || {};
                    obj[p[0]] = p[1];
                    return obj;
                }, undefined)
                .value();
        };

        Article.prototype.save = function() {
            if (this.parentArticle) {
                this.parentArticle.save();
                this.stopMetaEdit();
                return;
            }

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
