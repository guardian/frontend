/* global _: true, humanized_time_span: true */
define([
    'modules/vars',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/number-with-commas',
    'models/group',
    'modules/authed-ajax',
    'modules/content-api',
    'modules/ophan-api',
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
        contentApi,
        ophanApi,
        ko
        ){
        function Article(opts) {
            var self = this;

            opts = opts || {};

            this.parent = opts.parent;
            this.parentType = opts.parentType;

            this.uneditable = opts.uneditable;

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

            // Populate sublinks
            this.meta.sublinks = new Group({
                items: _.map((opts.meta || {}).sublinks, function(item) {
                    return new Article(_.extend(item, {
                        parent: self,
                        parentType: 'Article'
                    }));
                }),
                parent: self,
                parentType: 'Article',
                omitItem: self.save.bind(self)
            });

            contentApi.decorateItems(self.meta.sublinks.items());
            ophanApi.decorateItems(self.meta.sublinks.items());
        }

        Article.prototype.populate = function(opts) {
            var self = this;

            populateObservables(this.props,  opts);
            populateObservables(this.meta,   opts.meta);
            populateObservables(this.fields, opts.fields);
            populateObservables(this.state,  opts.state);
        };

        Article.prototype.startMetaEdit = function() {
            var self = this;

            if (this.uneditable) { return; }

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

            return _.chain(self.meta)
                .pairs()
                // execute any knockout values:
                .map(function(p){ return [p[0], _.isFunction(p[1]) ? p[1]() : p[1]]; })
                // reject undefined properties:
                .filter(function(p){ return !_.isUndefined(p[1]); })
                // reject whitespace-only strings:
                .filter(function(p){ return _.isString(p[1]) ? p[1].replace(/\s*/g, '').length > 0 : true; })
                // reject vals that don't differ from the props (if any) that they're overwriting:
                .filter(function(p){ return _.isUndefined(self.props[p[0]]) || self.props[p[0]]() !== p[1]; })
                // serialise sublinks
                .map(function(p) {
                    if (p[0] === 'sublinks') {
                        // but only on first level Articles, i.e. those whose parent is a Collection
                        return [p[0], self.parentType === 'Article' ? [] : _.map(p[1].items(), function(sublink) {
                            return {
                                id:   sublink.props.id(),
                                meta: sublink.getMeta()
                            };
                        })];
                    }
                    return [p[0], p[1]];
                })
                // drop empty arrays:
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
            var self = this;

            if (!this.parent) {
                return;
            }

            if (this.parentType === 'Article') {
                this.parent.save();
                this.stopMetaEdit();
                return;
            }

            if (this.parentType === 'Collection') {
                authedAjax.updateCollection(
                    'post',
                    this.parent,
                    {
                        item:     self.props.id(),
                        position: self.props.id(),
                        itemMeta: self.getMeta(),
                        live:     vars.state.liveMode(),
                        draft:   !vars.state.liveMode()
                    }
                );
                this.parent.state.loadIsPending(true);
            }
        };

        return Article;
    });
