/* global _: true */
define([
    'modules/vars',
    'knockout',
    'utils/mediator',
    'utils/url-abs-path',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/full-trim',
    'utils/deep-get',
    'utils/snap',
    'utils/human-time',
    'modules/copied-article',
    'modules/authed-ajax',
    'modules/content-api',
    'models/group'
],
    function (
        vars,
        ko,
        mediator,
        urlAbsPath,
        asObservableProps,
        populateObservables,
        fullTrim,
        deepGet,
        snap,
        humanTime,
        copiedArticle,
        authedAjax,
        contentApi,
        Group
    ) {
        function Article(opts) {
            var self = this;

            opts = opts || {};

            this.id = ko.observable(opts.id);

            this.group = opts.group;

            this.uneditable = opts.uneditable;

            this.frontPublicationDate = opts.frontPublicationDate;
            this.frontPublicationTime = ko.observable();
            this.scheduledPublicationTime = ko.observable();

            this.mainMediaType = ko.observable();

            this.props = asObservableProps([
                'webUrl',
                'webPublicationDate']);

            this.fields = asObservableProps([
                'isLive',
                'firstPublicationDate',
                'scheduledPublicationDate',
                'headline',
                'trailText',
                'thumbnail']);

            this.meta = asObservableProps([
                'href',
                'headline',
                'trailText',
                'kicker',
                'imageAdjust',
                'imageSrc',
                'imageSrcWidth',
                'imageSrcHeight',
                'showMainVideo',
                'group',
                'snapType',
                'snapCss',
                'snapUri']);

            this.state = asObservableProps([
                'underDrag',
                'isOpen',
                'isOpenImage',
                'isLoaded',
                'isEmpty',
                'ophanUrl',
                'sparkUrl']);

            this.headlineLength = ko.computed(function() {
                return (this.meta.headline() || this.fields.headline() || '').length;
            }, this);

            this.headlineLengthAlert = ko.computed(function() {
                return (this.meta.headline() || this.fields.headline() || '').length > vars.CONST.restrictedHeadlineLength;
            }, this);

            this.isSnap = ko.computed(function() {
                return !!snap.validateId(this.id());
            }, this);

            this.webPublicationTime = ko.computed(function(){
                return humanTime(this.props.webPublicationDate());
            }, this);

            this.viewUrl = ko.computed(function() {
                return this.fields.isLive() === 'false' ?
                    vars.CONST.previewBase + '/' + urlAbsPath(this.props.webUrl()) :
                    this.meta.href() || this.props.webUrl();
            }, this);

            this.headlineInput  = this.overrider('headline');
            this.headlineRevert = this.reverter('headline');

            this.trailTextInput  = this.overrider('trailText');
            this.trailTextRevert = this.reverter('trailText');

            this.provisionalImageSrc = ko.observable();

            this.meta.imageSrc.subscribe(function(src) {
                this.provisionalImageSrc(src);
            }, this);

            this.provisionalImageSrc.subscribe(function(src) {
                var self = this;

                if (src === this.meta.imageSrc()) { return; }

                this.validateImageSrc(src)
                .done(function(width, height) {
                    self.meta.imageSrc(src);
                    self.meta.imageSrcWidth(width);
                    self.meta.imageSrcHeight(height);

                    self.state.isOpenImage(false);
                    self.save();
                })
                .fail(function(err) {
                    self.provisionalImageSrc(undefined);
                    window.alert('Sorry! ' + err);
                });
            }, this);

            this.populate(opts);

            // Populate supporting
            if (this.group && this.group.parentType !== 'Article') {
                this.meta.supporting = new Group({
                    parent: self,
                    parentType: 'Article',
                    omitItem: self.save.bind(self)
                });

                this.meta.supporting.items(_.map((opts.meta || {}).supporting, function(item) {
                    return new Article(_.extend(item, {
                        group: self.meta.supporting
                    }));
                }));

                contentApi.decorateItems(this.meta.supporting.items());
            }
        }

        Article.prototype.copy = function() {
            copiedArticle.set(this);
        };

        Article.prototype.paste = function () {
            var sourceItem = copiedArticle.get(true);

            if(!sourceItem || sourceItem.id === this.id()) { return; }

            mediator.emit('collection:updates', {
                sourceItem: sourceItem,
                sourceGroup: sourceItem.group,
                targetItem: this,
                targetGroup: this.group
            });
        };

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

        function mainMediaType(contentApiArticle) {
            var mainElement = _.findWhere(contentApiArticle.elements || [], {
                relation: 'main'
            });
            return mainElement && mainElement.type;
        }

        Article.prototype.populate = function(opts, validate) {
            var missingProps;

            populateObservables(this.props,  opts);
            populateObservables(this.meta,   opts.meta);
            populateObservables(this.fields, opts.fields);
            populateObservables(this.state,  opts.state);

            var mainMedia = mainMediaType(opts);

            if (mainMedia) {
                this.mainMediaType(mainMedia);
            }

            this.setRelativeTimes();

            if (validate || opts.webUrl) {
                 missingProps = [
                    'webUrl',
                    'fields',
                    'fields.headline'
                 ].filter(function(prop) {return !deepGet(opts, prop);});

                if (missingProps.length) {
                    vars.model.statusCapiErrors(true);
                    window.console.error('ContentApi missing: "' + missingProps.join('", "') + '" for ' + this.id());
                } else {
                    this.state.isLoaded(true);
                    this.sparkline();
                }
            }
        };

        Article.prototype.setRelativeTimes = function() {
            this.frontPublicationTime(humanTime(this.frontPublicationDate));
            this.scheduledPublicationTime(humanTime(this.fields.scheduledPublicationDate()));
        };

        Article.prototype.sparkline = function() {
            var path = urlAbsPath(this.props.webUrl());

            if (vars.model.switches()['facia-tool-sparklines']) {
                this.state.sparkUrl(
                    vars.sparksBase + path + (this.frontPublicationDate ? '&markers=' + (this.frontPublicationDate/1000) + ':46C430' : '')
                );
                this.state.ophanUrl(
                    vars.CONST.ophanBase + '?path=/' + path
                );
            }
        };

        Article.prototype.refreshSparkline = function() {
            if (vars.model.switches()['facia-tool-sparklines']) {
                this.state.sparkUrl.valueHasMutated();
            }
        };

        Article.prototype.toggleImageAdjustHide = function() {
            this.meta.imageAdjust(this.meta.imageAdjust() === 'hide' ? undefined : 'hide');
            this._save();
        };

        Article.prototype.toggleShowMainVideo = function () {
            this.meta.showMainVideo(!this.meta.showMainVideo());
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
                self.state.isOpen(true);
            });
        };

        Article.prototype.toggleOpenImage = function() {
            this.state.isOpenImage(!this.state.isOpenImage());
        };

        Article.prototype.close = function() {
            var self = this;

            _.defer(function(){
                self.state.isOpen(false);
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
                // convert numbers to strings:
                .map(function(p){ return [p[0], _.isNumber(p[1]) ? '' + p[1] : p[1]]; })
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
            if (!this.group.parent) {
                return;
            }

            if (this.group.parentType === 'Article') {
                this.group.parent._save();
                return;
            }

            if (this.group.parentType === 'Collection') {
                this.group.parent.setPending(true);

                authedAjax.updateCollections({
                    update: {
                        collection: this.group.parent,
                        item:       this.id(),
                        position:   this.id(),
                        itemMeta:   this.getMeta(),
                        live:       vars.state.liveMode(),
                        draft:     !vars.state.liveMode()
                    }
                });
            }
        };

        Article.prototype.validateImageSrc = function(src) {
            var defer = $.Deferred(),
                img;

            if (!src) {
                defer.resolve();

            } else if (!src.match(new RegExp('^http://.*\\.' + vars.CONST.imageCdnDomain + '/'))) {
                defer.reject('Images must come from *.' + vars.CONST.imageCdnDomain);

            } else {
                img = new Image();
                img.onerror = function() {
                    defer.reject('That image could not be found');
                };
                img.onload = function() {
                    var width = this.width || 1,
                        height = this.height || 1,
                        err =  width > 940 ? 'Images cannot be more than 2048 pixels wide' :
                               width < 620 ? 'Images cannot be less than 620 pixels wide'  :
                               Math.abs((width * 3)/(height * 5) - 1) > 0.01 ?  'Images must have a 5x3 aspect ratio' : false;

                    if (err) {
                        defer.reject(err);
                    } else {
                        defer.resolve(width, height);
                    }
                };
                img.src = src;
            }

            return defer.promise();
        };

        Article.prototype.convertToSnap = function() {
            this.meta.href(this.id());
            this.id(snap.generateId());
            this.state.isOpen(!this.meta.headline());
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
