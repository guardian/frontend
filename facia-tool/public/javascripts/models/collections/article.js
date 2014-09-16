/* global _: true */
define([
    'modules/vars',
    'knockout',
    'utils/mediator',
    'utils/url-abs-path',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/full-trim',
    'utils/sanitize-html',
    'utils/deep-get',
    'utils/snap',
    'utils/human-time',
    'utils/validate-image-src',
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
        sanitizeHtml,
        deepGet,
        snap,
        humanTime,
        validateImageSrc,
        copiedArticle,
        authedAjax,
        contentApi,
        Group
    ) {
        var rootProps = [
                'webUrl',
                'webPublicationDate'],

            overridableFields = [
                'headline',
                'trailText',
                'byline'],

            allFields = [
                'isLive',
                'firstPublicationDate',
                'scheduledPublicationDate',
                'thumbnail'].concat(overridableFields),

            allMeta = [
                'href',
                'isBreaking',
                'isBoosted',
                'imageHide',
                'imageReplace',
                'imageSrc',
                'imageSrcWidth',
                'imageSrcHeight',
                'showMainVideo',
                'group',
                'snapType',
                'snapCss',
                'snapUri'].concat(overridableFields),

            editors = [
                {
                    key: 'headline',
                    label: 'Headline',
                    type: 'text',
                    maxLength: 90
                },
                {
                    key: 'trailText',
                    label: 'Trail text',
                    type: 'text'
                },
                {
                    key: 'byline',
                    label: 'byline',
                    type: 'text'
                },
                {
                    key: 'isBreaking',
                    label: 'breaking news',
                    type: 'boolean'
                },
                {
                    key: 'isBoosted',
                    label: 'boost',
                    type: 'boolean'
                },
                {
                    key: 'showMainVideo',
                    singleton: 'images',
                    label: 'show video',
                    type: 'boolean'
                },
                {
                    key: 'imageHide',
                    singleton: 'images',
                    label: 'hide image',
                    type: 'boolean'
                },
                {
                    key: 'imageReplace',
                    singleton: 'images',
                    label: 'replace image',
                    type: 'boolean'
                },
                {
                    key: 'imageSrc',
                    label: 'image URL',
                    requires: 'imageReplace',
                    validator: validateAndProcessImageSrc,
                    type: 'text'
                }
            ];

        function Article(opts) {
            var self = this;

            opts = opts || {};

            this.props = asObservableProps(rootProps);

            this.fields = asObservableProps(allFields);

            this.meta = asObservableProps(allMeta);

            this.isOpenMeta = asObservableProps(allMeta);

            this.state = asObservableProps([
                'underDrag',
                'isOpen',
                'isLoaded',
                'isEmpty',
                'ophanUrl',
                'sparkUrl']);

            this.editors = editors.map(this.editor, this);

            this.id = ko.observable(opts.id);

            this.group = opts.group;

            this.uneditable = opts.uneditable;

            this.frontPublicationDate = opts.frontPublicationDate;
            this.frontPublicationTime = ko.observable();
            this.scheduledPublicationTime = ko.observable();

            this.mainMediaType = ko.observable();

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

            this.provisionalImageSrc = ko.observable();

            this.meta.imageSrc.subscribe(function(src) {
                this.provisionalImageSrc(src);
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

        Article.prototype.editor = function(opts, index, all) {
            var self = this,
                key = opts.key,
                meta = self.meta[key] || function() {},
                field = self.fields[key] || function() {};

            if (_.isFunction(opts.validator)) {
                meta.extend({ rateLimit: 100 })
                meta.subscribe(function() {
                    opts.validator(meta, self.meta)
                }, this);
            }

            return {
                key:    key,
                label:  opts.label,
                type:   opts.type,

                meta:   meta,
                field:  field,
                revert: function() { meta(undefined); },
                open:   function() { mediator.emit('ui:open', meta); },

                visible: ko.computed(function() {
                    return opts.requires ? _.some(all, function(editor) { return editor.key === opts.requires && self.meta[editor.key](); }) : true;
                }, self),

                toggle: function() {
                    if(opts.singleton) {
                       _.chain(all)
                        .filter(function(editor) { return editor.singleton === opts.singleton; })
                        .filter(function(editor) { return editor.key !== key; })
                        .pluck('key')
                        .each(function(key) { self.meta[key](undefined) })
                    }

                    meta(!meta());

                   _.chain(all)
                    .filter(function(editor) { return editor.requires === key; })
                    .first(1)
                    .each(function(editor) { mediator.emit('ui:open', self.meta[editor.key]); })
                },

                length: ko.computed(function() {
                    return opts.maxLength ? (meta() || field() || '').length : undefined;
                }, self),

                lengthAlert: ko.computed(function() {
                    return opts.maxLength && (meta() || field() || '').length > opts.maxLength;
                }, self),

                overrideOrVal: ko.computed({
                    read: function() {
                        return meta() || field();
                    },
                    write: function(value) {
                        meta(value);
                    },
                    owner: self
                })
            }
        }

        function mainMediaType(contentApiArticle) {
            var mainElement = _.findWhere(contentApiArticle.elements || [], {
                relation: 'main'
            });
            return mainElement && mainElement.type;
        }

        function validateAndProcessImageSrc(imageSrc, meta) {
            if (imageSrc()) {
                validateImageSrc(imageSrc(), {
                    maxWidth: 940,
                    minWidth: 620,
                    widthAspectRatio: 3,
                    heightAspectRatio: 5
                })
                .done(function(width, height) {
                    meta.imageSrcWidth(width);
                    meta.imageSrcHeight(height);
                })
                .fail(clearImageMeta);
            } else {
                clearImageMeta();
            }

            function clearImageMeta() {
                meta.imageSrc(undefined);
                meta.imageSrcWidth(undefined);
                meta.imageSrcHeight(undefined);
            };
        };

        Article.prototype.populate = function(opts, validate) {
            var missingProps;

            populateObservables(this.props,  opts);
            populateObservables(this.meta,   opts.meta);
            populateObservables(this.fields, opts.fields);
            populateObservables(this.state,  opts.state);

            this.mainMediaType(mainMediaType(opts));

            this.setRelativeTimes();

            if (validate || opts.webUrl) {
                 missingProps = [
                    'webUrl',
                    'fields',
                    'fields.headline'
                 ].filter(function(prop) {return !deepGet(opts, prop);});

                if (missingProps.length) {
                    vars.model.alert('ContentApi is returning invalid data. Fronts may not update.');
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
                // trim and sanitize strings:
                .map(function(p){ return [p[0], sanitizeHtml(fullTrim(p[1]))]; })
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

        Article.prototype.save = function() {
            if (!this.group.parent) {
                return;
            }

            if (this.group.parentType === 'Article') {
                this.group.parent.save();
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

        Article.prototype.convertToSnap = function() {
            this.meta.href(this.id());
            this.id(snap.generateId());
            this.state.isOpen(!this.meta.headline());
        };

        Article.prototype.open = function() {
            if (this.uneditable) { return; }

            if (!this.state.isOpen()) {
                 this.state.isOpen(true);
                 mediator.emit('ui:open', this.meta.headline);
            }
        };

        Article.prototype.close = function() {
            this.state.isOpen(false);
        };

        Article.prototype.closeAndSave = function() {
            this.close();
            this.save();
            return false;
        };

        return Article;
    });
