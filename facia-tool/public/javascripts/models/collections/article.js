/* global _: true */
define([
    'modules/vars',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/full-trim',
    'utils/deep-get',
    'utils/snap',
    'utils/human-time',
    'models/group',
    'modules/authed-ajax',
    'modules/content-api',
    'knockout'
],
    function (
        vars,
        asObservableProps,
        populateObservables,
        fullTrim,
        deepGet,
        snap,
        humanTime,
        Group,
        authedAjax,
        contentApi,
        ko
        ){
        function Article(opts) {
            var self = this;

            opts = opts || {};

            this.id = ko.observable(opts.id);

            this.parent = opts.parent;
            this.parentType = opts.parentType;
            this.uneditable = opts.uneditable;

            this.frontPublicationDate = opts.frontPublicationDate;
            this.frontPublicationTime = ko.observable();

            this.props = asObservableProps([
                'webPublicationDate']);

            this.fields = asObservableProps([
                'headline',
                'trailText',
                'thumbnail']);

            this.meta = asObservableProps([
                'href',
                'headline',
                'trailText',
                'imageAdjust',
                'imageSrc',
                'isBreaking',
                'group',
                'snapType',
                'snapCss',
                'snapUri']);

            this.state = asObservableProps([
                'underDrag',
                'open',
                'isLoaded',
                'isEmpty',
                'sparkUrl']);

            this.isSnap = ko.computed(function() {
                return !!snap.validateId(this.id());
            }, this);

            // Computeds
            this.webPublicationTime = ko.computed(function(){
                return humanTime(this.props.webPublicationDate());
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
            }

            this.sparkline();
            this.setFrontPublicationTime();
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

        Article.prototype.populate = function(opts, withContent) {
            var missingProps;

            populateObservables(this.props,  opts);
            populateObservables(this.meta,   opts.meta);
            populateObservables(this.fields, opts.fields);
            populateObservables(this.state,  opts.state);

            if (withContent) {
                 missingProps = [
                    'webPublicationDate',
                    'fields',
                    'fields.headline'
                 ].filter(function(prop) {return !deepGet(opts, prop);});

                if (missingProps.length) {
                    vars.model.statusCapiErrors(true);
                    window.console.error('ContentApi missing: "' + missingProps.join('", "') + '" for ' + this.id());
                } else {
                    this.state.isLoaded(true);
                }
            }
        };

        Article.prototype.setFrontPublicationTime = function() {
            this.frontPublicationTime(humanTime(this.frontPublicationDate));
        };

        Article.prototype.toggleIsBreaking = function() {
            this.meta.isBreaking(!this.meta.isBreaking());
            this._save();
        };

        Article.prototype.sparkline = function() {
            this.state.sparkUrl(undefined);
            if (vars.model.switches()['facia-tool-sparklines']) {
                this.state.sparkUrl(
                    vars.sparksBase + this.id() +
                    (this.frontPublicationDate ? '&markers=' + (this.frontPublicationDate/1000) + ':FED24C' : '')
                );
            }
        };

        Article.prototype.toggleImageAdjustHide = function() {
            this.meta.imageAdjust(this.meta.imageAdjust() === 'hide' ? undefined : 'hide');
            this._save();
        };

        Article.prototype.toggleImageAdjustBoost = function() {
            this.meta.imageAdjust(this.meta.imageAdjust() === 'boost' ? undefined : 'boost');
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
                id:   this.id(),
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
                // reject false properties:
                .filter(function(p){ return p[1] !== false; })
                // trim strings:
                .map(function(p){ return [p[0], _.isString(p[1]) ? fullTrim(p[1]) : p[1]]; })
                // reject whitespace-only strings:
                .filter(function(p){ return _.isString(p[1]) ? p[1] : true; })
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
                // return as obj, or as undefined if empty (this omits it from any subsequent JSON.stringify result)
                .reduce(function(obj, p) {
                    obj = obj || {};
                    obj[p[0]] = p[1];
                    return obj;
                }, undefined)
                .value();
        };

        Article.prototype._save = function() {
            var timestamp,
                itemMeta;

            if (!this.parent) {
                return;
            }

            if (this.parentType === 'Article') {
                this.parent._save();
                return;
            }

            if (this.parentType === 'Collection') {

                itemMeta = this.getMeta();
                timestamp = Math.floor(new Date().getTime()/1000);

                authedAjax.updateCollections({
                    update: {
                        collection: this.parent,
                        item:       this.id(),
                        position:   this.id(),
                        itemMeta:   itemMeta,
                        live:       vars.state.liveMode(),
                        draft:     !vars.state.liveMode()
                    }
                });

                this.parent.setPending(true);
            }
        };

        Article.prototype.convertToSnap = function() {
            this.meta.href(this.id());
            this.id(snap.generateId());
            this.state.open(!this.meta.headline());
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
