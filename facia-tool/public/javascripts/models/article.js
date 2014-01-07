/* global humanized_time_span: true */
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
    'lodash/chaining/chain',
    'lodash/objects/isUndefined',
    'lodash/collections/map',
    'lodash/objects/assign',
    'lodash/functions/defer',
    'lodash/objects/isFunction',
    'lodash/objects/isString',
    'lodash/objects/isArray',
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
        ko,
        chain,
        isUndefined,
        map,
        assign,
        defer,
        isFunction,
        isString,
        isArray
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

            // Populate supporting
            if (this.parentType !== 'Article') {
                this.meta.supporting = new Group({
                    items: map((opts.meta || {}).supporting, function(item) {
                        return new Article(assign(item, {
                            parent: self,
                            parentType: 'Article'
                        }));
                    }),
                    parent: self,
                    parentType: 'Article',
                    omitItem: self.save.bind(self)
                });

                contentApi.decorateItems(self.meta.supporting.items());
                ophanApi.decorateItems(self.meta.supporting.items());
            }
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

            defer(function(){
                self.state.editingMeta(true);
            });
        };

        Article.prototype.stopMetaEdit = function() {
            var self = this;
            defer(function(){
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

        Article.prototype.get = function() {
            return {
                id:   this.props.id(),
                meta: this.getMeta()
            };
        };

        Article.prototype.getMeta = function() {
            var self = this;

            return chain(self.meta)
                .pairs()
                // execute any knockout values:
                .map(function(p){ return [p[0], isFunction(p[1]) ? p[1]() : p[1]]; })
                // reject undefined properties:
                .filter(function(p){ return !isUndefined(p[1]); })
                // reject whitespace-only strings:
                .filter(function(p){ return isString(p[1]) ? p[1].replace(/\s*/g, '').length > 0 : true; })
                // reject vals that don't differ from the props (if any) that they're overwriting:
                .filter(function(p){ return isUndefined(self.props[p[0]]) || self.props[p[0]]() !== p[1]; })
                // serialise supporting
                .map(function(p) {
                    if (p[0] === 'supporting') {
                        // but only on first level Articles, i.e. those whose parent isn't an Article
                        return [p[0], self.parentType === 'Article' ? [] : map(p[1].items(), function(item) {
                            return item.get();
                        })];
                    }
                    return [p[0], p[1]];
                })
                // drop empty arrays:
                .filter(function(p){ return isArray(p[1]) ? p[1].length : true; })
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
