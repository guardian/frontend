/* global _: true, humanized_time_span: true */
define([
    'modules/vars',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/number-with-commas',
    'utils/full-trim',
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
        fullTrim,
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
                'trailText',
                'thumbnail',
                'shortId']);

            this.fields.headline('...');

            this.meta = asObservableProps([
                'headline',
                'trailText',
                'imageAdjust',
                'group']);

            this.state = asObservableProps([
                'underDrag',
                'open',
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

            this.headlineInput  = this.overrider('headline');
            this.headlineRevert = this.reverter('headline');

            this.trailTextInput  = this.overrider('trailText');
            this.trailTextRevert = this.reverter('trailText');

            this.populate(opts);

            // Populate supporting
            if (this.parentType !== 'Article') {
                this.meta.supporting = new Group({
                    items: _.map((opts.meta || {}).supporting, function(item) {
                        return new Article(_.extend(item, {
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

        Article.prototype.overrider = function(key) {
            return ko.computed({
                read: function() {
                    return this.meta[key]() || this.fields[key]();
                },
                write: function(value) {
                    var el = document.createElement('div');
                    el.innerHTML = value;
                    this.meta[key](el.innerHTML);
                },
                owner: this
            });
        };

        Article.prototype.reverter = function(key) {
            return function() {
                this.meta[key](undefined);
                this._save();
            };
        };

        Article.prototype.populate = function(opts) {
            populateObservables(this.props,  opts);
            populateObservables(this.meta,   opts.meta);
            populateObservables(this.fields, opts.fields);
            populateObservables(this.state,  opts.state);
        };

        Article.prototype.toggleImageAdjustHide = function() {
            this.meta.imageAdjust(this.meta.imageAdjust() === 'hide' ? undefined : 'hide');
            this._save();
        };

        Article.prototype.toggleImageAdjustHighlight = function() {
            this.meta.imageAdjust(this.meta.imageAdjust() === 'highlight' ? undefined : 'highlight');
            this._save();
        };

        Article.prototype.open = function() {
            var self = this;

            if (this.uneditable) { return; }

            _.defer(function(){
                self.state.open(true);
            });
        };

        Article.prototype.close = function() {
            var self = this;
            _.defer(function(){
                self.state.open(false);
            });
        };

        Article.prototype.get = function() {
            return {
                id:   this.props.id(),
                meta: this.getMeta()
            };
        };

        Article.prototype.getMeta = function() {
            var self = this;

            return _.chain(self.meta)
                .pairs()
                // execute any knockout values:
                .map(function(p){ return [p[0], _.isFunction(p[1]) ? p[1]() : p[1]]; })
                // reject undefined properties:
                .filter(function(p){ return !_.isUndefined(p[1]); })
                // trim strings:
                .map(function(p){ return [p[0], _.isString(p[1]) ? fullTrim(p[1]) : p[1]]; })
                // reject whitespace-only strings:
                .filter(function(p){ return _.isString(p[1]) ? p[1] : true; })
                // for sublinks reject anything that isn't a headline
                .filter(function(p){ return p[0] === 'headline' || self.parentType !== 'Article'; })
                // reject vals that are equivalent to the fields (if any) that they're overwriting:
                .filter(function(p){ return _.isUndefined(self.fields[p[0]]) || p[1] !== fullTrim(self.fields[p[0]]()); })
                // recurse into supporting links
                .map(function(p) {
                    return [p[0], p[0] === 'supporting' ? _.map(p[1].items(), function(item) {
                        return item.get();
                    }) : p[1]];
                })
                // drop empty arrays:
                .filter(function(p){ return _.isArray(p[1]) ? p[1].length : true; })
                // return as obj, or as undefined if empty (this ommits it from any subsequent JSON.stringify result)
                .reduce(function(obj, p, key) {
                    obj = obj || {};
                    obj[p[0]] = p[1];
                    return obj;
                }, undefined)
                .value();
        };

        Article.prototype._save = function() {
            var self = this;

            if (!this.parent) {
                return;
            }

            if (this.parentType === 'Article') {
                this.parent._save();
                this.close();
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
                this.parent.setPending(true);
            }
        };

        Article.prototype.save = function() {
            var self = this;

            // defer, to let through UI events before they're blocked by the "isPending" CSS:
            setTimeout(function() {
                self._save();
            }, 200);
        };

        return Article;
    });
