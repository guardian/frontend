/*eslint-disable consistent-return*/
define([
    'modules/vars',
    'knockout',
    'underscore',
    'jquery',
    'utils/alert',
    'utils/as-observable-props',
    'utils/deep-get',
    'utils/draggable-element',
    'utils/full-trim',
    'utils/human-time',
    'utils/identity',
    'utils/is-guardian-url',
    'utils/logger',
    'utils/mediator',
    'utils/populate-observables',
    'utils/sanitize-html',
    'utils/snap',
    'utils/url-abs-path',
    'utils/url-host',
    'utils/validate-image-src',
    'modules/copied-article',
    'modules/authed-ajax',
    'modules/content-api',
    'models/group'
],
    function (
        vars,
        ko,
        _,
        $,
        alert,
        asObservableProps,
        deepGet,
        draggableElement,
        fullTrim,
        humanTime,
        identity,
        isGuardianUrl,
        logger,
        mediator,
        populateObservables,
        sanitizeHtml,
        snap,
        urlAbsPath,
        urlHost,
        validateImageSrc,
        copiedArticle,
        authedAjax,
        contentApi,
        Group
    ) {
        alert = alert.default;
        deepGet = deepGet.default;
        fullTrim = fullTrim.default;
        isGuardianUrl = isGuardianUrl.default;
        urlHost = urlHost.default;
        sanitizeHtml = sanitizeHtml.default;
        urlAbsPath = urlAbsPath.default;
        asObservableProps = asObservableProps.default;
        populateObservables = populateObservables.default;
        mediator = mediator.default;
        humanTime = humanTime.default;
        validateImageSrc = validateImageSrc.default;

        var capiProps = [
                'webUrl',
                'webPublicationDate',
                'sectionName'],

            capiFields = [
                'headline',
                'trailText',
                'byline',
                'isLive',
                'firstPublicationDate',
                'scheduledPublicationDate',
                'thumbnail'],

            metaFields = [
                {
                    key: 'headline',
                    editable: true,
                    slimEditable: true,
                    ifState: 'enableContentOverrides',
                    label: 'headline',
                    type: 'text',
                    maxLength: 120
                },
                {
                    key: 'trailText',
                    editable: true,
                    ifState: 'enableContentOverrides',
                    omitForSupporting: true,
                    label: 'trail text',
                    type: 'text'
                },
                {
                    key: 'byline',
                    editable: true,
                    ifState: 'enableContentOverrides',
                    'if': 'showByline',
                    omitForSupporting: true,
                    label: 'byline',
                    type: 'text'
                },
                {
                    key: 'customKicker',
                    editable: true,
                    'if': 'showKickerCustom',
                    label: 'custom kicker',
                    type: 'text'
                },
                {
                    key: 'href',
                    label: 'special link URL',
                    type: 'text'
                },
                {
                    key: 'imageSrc',
                    editable: true,
                    dropImage: true,
                    omitForSupporting: true,
                    'if': 'imageReplace',
                    label: 'replacement image URL',
                    validator: {
                        fn: 'validateImage',
                        params: {
                            src: 'imageSrc',
                            width: 'imageSrcWidth',
                            height: 'imageSrcHeight',
                            options: {
                                maxWidth: 1000,
                                minWidth: 400,
                                widthAspectRatio: 5,
                                heightAspectRatio: 3
                            }
                        }
                    },
                    type: 'text'
                },
                {
                    key: 'imageSrcWidth',
                    'if': 'imageReplace',
                    label: 'replacement image width',
                    type: 'text'
                },
                {
                    key: 'imageSrcHeight',
                    'if': 'imageReplace',
                    label: 'replacement image height',
                    type: 'text'
                },
                {
                    key: 'imageCutoutSrc',
                    editable: true,
                    dropImage: true,
                    omitForSupporting: true,
                    'if': 'imageCutoutReplace',
                    label: 'replacement cutout image URL',
                    validator: {
                        fn: 'validateImage',
                        params: {
                            src: 'imageCutoutSrc',
                            width: 'imageCutoutSrcWidth',
                            height: 'imageCutoutSrcHeight',
                            options: {
                                maxWidth: 1000,
                                minWidth: 400
                            }
                        }
                    },
                    type: 'text'
                },
                {
                    key: 'imageCutoutSrcWidth',
                    'if': 'imageCutoutReplace',
                    label: 'replacement cutout image width',
                    type: 'text'
                },
                {
                    key: 'imageCutoutSrcHeight',
                    'if': 'imageCutoutReplace',
                    label: 'replacement cutout image height',
                    type: 'text'
                },
                {
                    key: 'isBreaking',
                    editable: true,
                    singleton: 'kicker',
                    label: 'breaking news',
                    type: 'boolean'
                },
                {
                    key: 'isBoosted',
                    editable: true,
                    omitForSupporting: true,
                    ifState: 'inDynamicCollection',
                    label: 'boost',
                    type: 'boolean'
                },
                {
                    key: 'showMainVideo',
                    editable: true,
                    omitForSupporting: true,
                    ifState: 'hasMainVideo',
                    singleton: 'images',
                    label: 'show video',
                    type: 'boolean'
                },
                {
                    key: 'showBoostedHeadline',
                    editable: true,
                    omitForSupporting: true,
                    label: 'large headline',
                    type: 'boolean'
                },
                {
                    key: 'showQuotedHeadline',
                    editable: true,
                    omitForSupporting: true,
                    label: 'quote headline',
                    type: 'boolean'
                },
                {
                    key: 'showByline',
                    editable: true,
                    omitForSupporting: true,
                    label: 'byline',
                    type: 'boolean'
                },
                {
                    key: 'imageCutoutReplace',
                    editable: true,
                    omitForSupporting: true,
                    singleton: 'images',
                    label: 'cutout image',
                    type: 'boolean'
                },
                {
                    key: 'imageReplace',
                    editable: true,
                    omitForSupporting: true,
                    singleton: 'images',
                    label: 'replace image',
                    omitIfNo: 'imageSrc',
                    type: 'boolean'
                },
                {
                    key: 'imageHide',
                    editable: true,
                    omitForSupporting: true,
                    singleton: 'images',
                    label: 'hide image',
                    type: 'boolean'
                },
                {
                    key: 'showKickerTag',
                    editable: true,
                    singleton: 'kicker',
                    label: 'kicker',
                    labelState: 'primaryTag',
                    type: 'boolean'
                },
                {
                    key: 'showKickerSection',
                    editable: true,
                    singleton: 'kicker',
                    label: 'kicker',
                    labelState: 'sectionName',
                    type: 'boolean'
                },
                {
                    key: 'showKickerCustom',
                    editable: true,
                    singleton: 'kicker',
                    label: 'custom kicker',
                    labelMeta: 'customKicker',
                    type: 'boolean'
                },
                {
                    key: 'snapUri',
                    label: 'snap target',
                    type: 'text'
                },
                {
                    key: 'snapType',
                    label: 'snap type',
                    type: 'text'
                },
                {
                    key: 'snapCss',
                    label: 'snap class',
                    type: 'text'
                },
                {
                    key: 'imageSlideshowReplace',
                    omitForSupporting: true,
                    editable: true,
                    label: 'slideshow',
                    singleton: 'images',
                    type: 'boolean'
                },
                {
                    key: 'slideshow',
                    editable: true,
                    omitForSupporting: true,
                    'if': 'imageSlideshowReplace',
                    type: 'list',
                    length: vars.CONST.maxSlideshowImages,
                    item: {
                        type: 'image',
                        editable: true,
                        dropImage: true,
                        validator: {
                            fn: 'validateListImage',
                            params: {
                                options: {
                                    maxWidth: 1000,
                                    minWidth: 400,
                                    widthAspectRatio: 5,
                                    heightAspectRatio: 3
                                }
                            }
                        }
                    }
                }
            ],

            rxScriptStriper = new RegExp(/<script.*/gi);

        function Article(opts, withCapiData) {
            var self = this;

            opts = opts || {};

            this.id = ko.observable(opts.id);

            this.group = opts.group;

            this.front = opts.group ? opts.group.front : null;

            this.props = asObservableProps(capiProps);
            this.props.webPublicationDate.extend({ notify: 'always' });

            this.fields = asObservableProps(capiFields);

            this.meta = asObservableProps(_.pluck(metaFields, 'key'));

            populateObservables(this.meta, opts.meta);

            this.metaDefaults = {};

            this.collectionMetaDefaults = deepGet(opts, '.group.parent.itemDefaults');

            this.uneditable = opts.uneditable;

            this.slimEditor = opts.slimEditor;

            this.state = asObservableProps([
                'enableContentOverrides',
                'underDrag',
                'underControlDrag',
                'isOpen',
                'isLoaded',
                'isEmpty',
                'inDynamicCollection',
                'tone',
                'primaryTag',
                'sectionName',
                'hasMainVideo',
                'imageCutoutSrcFromCapi',
                'ophanUrl',
                'sparkUrl',
                'premium']);

            this.state.enableContentOverrides(this.meta.snapType() !== 'latest');
            this.state.inDynamicCollection(deepGet(opts, '.group.parent.isDynamic'));

            this.frontPublicationDate = opts.frontPublicationDate;
            this.frontPublicationTime = ko.observable();
            this.scheduledPublicationTime = ko.observable();

            this.editors = ko.observableArray();

            this.editorsDisplay = ko.observableArray();

            this.headline = ko.pureComputed(function () {
                var meta = this.meta, fields = this.fields;
                if (this.state.enableContentOverrides()) {
                    return meta.headline() || fields.headline() || (meta.snapType() ? 'No headline!' : 'Loading...');
                } else {
                    return '{ ' + meta.customKicker() + ' }';
                }
            }, this);

            this.headlineLength = ko.pureComputed(function() {
                return (this.meta.headline() || this.fields.headline() || '').length;
            }, this);

            this.headlineLengthAlert = ko.pureComputed(function() {
                return (this.meta.headline() || this.fields.headline() || '').length > vars.CONST.restrictedHeadlineLength;
            }, this);


            this.webPublicationTime = ko.pureComputed(function(){
                return humanTime(this.props.webPublicationDate());
            }, this);

            this.viewUrl = ko.pureComputed(function() {
                var url;
                if (this.fields.isLive() === 'false') {
                    url = vars.CONST.previewBase + '/' + urlAbsPath(this.props.webUrl());
                } else {
                    url = this.meta.href() || this.props.webUrl();

                    if (url && !/^https?:\/\//.test(url)) {
                        url = 'http://' + vars.CONST.mainDomain + url;
                    }
                }

                return url;
            }, this);

            // Populate supporting
            if (this.group && this.group.parentType !== 'Article') {
                this.meta.supporting = new Group({
                    parent: self,
                    parentType: 'Article',
                    omitItem: self.save.bind(self),
                    front: self.front,
                    elementHasFocus: self.group.elementHasFocus.bind(self.group)
                });

                this.meta.supporting.items(_.map((opts.meta || {}).supporting, function(item) {
                    return new Article(_.extend(item, {
                        group: self.meta.supporting
                    }));
                }));

                contentApi.decorateItems(this.meta.supporting.items());
            }

            if (withCapiData) {
                this.addCapiData(opts);
            } else {
                this.updateEditorsDisplay();
            }

            this.thumbImage = ko.pureComputed(function () {
                var meta = this.meta,
                    fields = this.fields,
                    state = this.state;

                if (meta.imageReplace() && meta.imageSrc()) {
                    return meta.imageSrc();
                } else if (meta.imageCutoutReplace()) {
                    return meta.imageCutoutSrc() || state.imageCutoutSrcFromCapi() || fields.thumbnail();
                } else if (meta.imageSlideshowReplace && meta.imageSlideshowReplace() && meta.slideshow() && meta.slideshow()[0]) {
                    return meta.slideshow()[0].src;
                } else {
                    return fields.thumbnail();
                }
            }, this);
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
                targetGroup: this.group,
                sourceContext: sourceItem.front,
                targetContext: this.front
            });
        };

        Article.prototype.metaDisplayer = function(opts, index, all) {
            var self = this,
                display,
                label;

            if (opts.type === 'boolean') {
                display = opts.editable;
                display = display && (this.meta[opts.key] || function() {})();
                display = display && (opts.omitIfNo ? _.some(all, function(editor) { return editor.key === opts.omitIfNo && self.meta[editor.key](); }) : true);
                display = display && (opts.omitForSupporting ? this.group.parentType !== 'Article' : true);

                label = _.chain([
                    opts.label,
                    _.result(this.state, opts.labelState),
                    _.result(this.meta,  opts.labelMeta)
                ])
                .compact()
                .value()
                .join(': ');

                return display ? label : false;
            } else {
                return false;
            }
        };

        Article.prototype.metaEditor = function(opts, index, all, defaults) {
            var self = this,
                key,
                meta,
                field,
                items = [];

            if (!opts.editable) { return; }
            if (this.slimEditor && opts.slimEditable !== true) { return; }
            if (!defaults) { defaults = {}; }

            key = opts.key;
            meta = self.meta[key] || ko.observable(defaults.meta);
            field = self.fields[key] || ko.observable(defaults.field);

            if (opts.validator && _.isFunction(self[opts.validator.fn])) {
                meta.subscribe(function() {
                    self[opts.validator.fn](opts.validator.params, meta);
                });
            }

            if (opts.type === 'list') {
                items = _.chain(opts.length)
                .times(function (i) {
                    return this.metaEditor(opts.item, null, all, {
                        meta: (self.meta[key]() || [])[i]
                    });
                }, this)
                .filter(function (editor) { return !!editor; })
                .map(function (editor) {
                    editor.meta.subscribe(function () {
                        meta(_.map(items, function (item) {
                            return item.meta();
                        }));
                    });
                    return editor;
                })
                .value();
            }

            return {
                key: key,

                label: opts.label + (opts.labelState ? ': ' + _.result(this.state, opts.labelState) : ''),

                type: opts.type,

                meta: meta,

                field: field,

                items: items,

                revert: function() { meta(undefined); },

                open:   function() { mediator.emit('ui:open', meta, self, self.front); },

                hasFocus: ko.pureComputed(function() {
                    return this.group.elementHasFocus(meta);
                }, self),

                displayEditor: ko.pureComputed(function() {
                    var display = opts.if ? _.some(all, function(editor) { return editor.key === opts.if && self.meta[editor.key](); }) : true;

                    display = display && (self.state.enableContentOverrides() || key === 'customKicker');
                    display = display && (opts.ifState ? self.state[opts.ifState]() : true);
                    display = display && (opts.omitForSupporting ? this.group.parentType !== 'Article' : true);

                    return display;
                }, self),

                toggle: function() {
                    if(opts.singleton) {
                       _.chain(all)
                        .filter(function(editor) { return editor.singleton === opts.singleton; })
                        .filter(function(editor) { return editor.key !== key; })
                        .pluck('key')
                        .each(function(key) { self.meta[key](false); });
                    }

                    meta(!meta());

                   _.chain(all)
                    .filter(function(editor) { return editor.if === key; })
                    .first(1)
                    .each(function(editor) { mediator.emit('ui:open', self.meta[editor.key], self, self.front); });
                },

                length: ko.pureComputed(function() {
                    return opts.maxLength ? opts.maxLength - (meta() || field() || '').length : undefined;
                }, self),

                lengthAlert: ko.pureComputed(function() {
                    return opts.maxLength && (meta() || field() || '').length > opts.maxLength;
                }, self),

                overrideOrVal: ko.computed({
                    read: function() {
                        return meta() || field();
                    },
                    write: function(value) {
                        meta(value === field() ? undefined : value.replace(rxScriptStriper, ''));
                    },
                    owner: self
                }),

                dropImage: ko.observable(!!opts.dropImage),

                underDrag: ko.observable(false),

                dropInEditor: function (element) {
                    var sourceMeta = element.getData('sourceMeta');
                    if (sourceMeta) {
                        try {
                            sourceMeta = JSON.parse(sourceMeta);
                            meta(sourceMeta);
                            return;
                        } catch (ex) {/**/}
                    }

                    try {
                        meta({
                            media: draggableElement.getMediaItem(element),
                            origin: element.getData('Url')
                        });
                    } catch (ex) {
                        alert(ex.message);
                    }
                },

                clear: function () {
                    undefineObservables(meta);
                }
            };
        };

        Article.prototype.addCapiData = function(opts) {
            var missingProps;

            populateObservables(this.props,  opts);
            populateObservables(this.fields, opts.fields);

            this.setRelativeTimes();

            missingProps = [
                'webUrl',
                'fields',
                'fields.headline'
            ].filter(function(prop) {return !deepGet(opts, prop); });

            if (missingProps.length) {
                vars.model.alert('ContentApi is returning invalid data. Fronts may not update.');
                logger.error('ContentApi missing: "' + missingProps.join('", "') + '" for ' + this.id());
            } else {
                this.state.isLoaded(true);
                this.state.sectionName(this.props.sectionName());
                this.state.primaryTag(getPrimaryTag(opts));
                this.state.imageCutoutSrcFromCapi(getContributorImage(opts));
                this.state.hasMainVideo(getMainMediaType(opts) === 'video');
                this.state.tone(opts.frontsMeta && opts.frontsMeta.tone);
                this.state.ophanUrl(vars.CONST.ophanBase + '?path=/' + urlAbsPath(opts.webUrl));
                this.state.premium(isPremium(opts));

                this.metaDefaults = _.extend(deepGet(opts, '.frontsMeta.defaults') || {}, this.collectionMetaDefaults);

                populateObservables(this.meta, this.metaDefaults);

                this.updateEditorsDisplay();
            }
        };

        Article.prototype.updateEditorsDisplay = function() {
            if (!this.uneditable) {
                this.editorsDisplay(metaFields.map(this.metaDisplayer, this).filter(identity));
            }
        };

        Article.prototype.setRelativeTimes = function() {
            this.frontPublicationTime(humanTime(this.frontPublicationDate));
            this.scheduledPublicationTime(humanTime(this.fields.scheduledPublicationDate()));
        };

        Article.prototype.get = function() {
            return {
                id:   this.id(),
                meta: this.getMeta()
            };
        };

        Article.prototype.getMeta = function() {
            var self = this,
                cleanMeta;

            cleanMeta = _.chain(self.meta)
                .pairs()
                // execute any knockout values:
                .map(function(p){ return [p[0], _.isFunction(p[1]) ? p[1]() : p[1]]; })
                // trim and sanitize strings:
                .map(function(p){ return [p[0], sanitizeHtml(fullTrim(p[1]))]; })
                // reject vals that are equivalent to their defaults (if set)
                .filter(function(p){ return _.has(self.metaDefaults, p[0]) ? self.metaDefaults[p[0]] !== p[1] : !!p[1]; })
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
                // clean sparse arrays
                .map(function (p) {
                    return [p[0], _.isArray(p[1]) ? _.filter(p[1], function (item) { return !!item; }) : p[1]];
                })
                // drop empty arrays:
                .filter(function(p){ return _.isArray(p[1]) ? p[1].length : true; })
                // recurse convert numbers to strings:
                .map(function(p){ return [p[0], _.isArray(p[1]) ? _.map(p[1], function (nested) {
                    return _.isObject(nested) ? _.mapObject(nested, function (val) {
                        return _.isNumber(val) ? '' + val : val;
                    }) : nested; }) : p[1]];
                })
                // return as obj, or as undefined if empty (this omits it from any subsequent JSON.stringify result)
                .reduce(function(obj, p) {
                    obj = obj || {};
                    obj[p[0]] = p[1];
                    return obj;
                }, {})
                .value();

            if (this.group && this.group.parentType === 'Collection') {
                cleanMeta.group = this.group.index + '';
            }

            return _.isEmpty(cleanMeta) ? undefined : cleanMeta;
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
                        mode:       this.front.mode()
                    }
                });
            }
        };

        Article.prototype.convertToSnap = function() {
            var id = this.id(),
                href = isGuardianUrl(id) ? '/' + urlAbsPath(id) : id;

            this.meta.href(href);
            this.id(snap.generateId());
            this.updateEditorsDisplay();
        };

        Article.prototype.convertToLinkSnap = function() {
            if (!this.meta.headline()) {
                this.decorateFromOpenGraph();
            }

            this.meta.snapType('link');

            this.convertToSnap();
        };

        Article.prototype.convertToLatestSnap = function(kicker) {
            this.meta.snapType('latest');
            this.meta.snapUri(urlAbsPath(this.id()));

            this.meta.showKickerCustom(true);
            this.meta.customKicker(kicker);

            this.meta.headline(undefined);
            this.meta.trailText(undefined);
            this.meta.byline(undefined);

            this.state.enableContentOverrides(false);

            this.convertToSnap();
        };

        Article.prototype.decorateFromOpenGraph = function() {
            var self = this,
                url = this.id(),
                isOnSite = isGuardianUrl(url);

            this.meta.headline('Fetching headline...');

            authedAjax.request({
                url: '/http/proxy/' + url + (isOnSite ? '?view=mobile' : ''),
                type: 'GET'
            })
            .done(function(response) {
                var doc = document.createElement('div'),
                    title,
                    og = {};

                doc.innerHTML = response;

                Array.prototype.forEach.call(doc.querySelectorAll('meta[property^="og:"]'), function(tag) {
                    og[tag.getAttribute('property').replace(/^og\:/, '')] = tag.getAttribute('content');
                });

                title = doc.querySelector('title');
                title = title ? title.innerHTML : undefined;

                self.meta.headline(og.title || title);
                self.meta.trailText(og.description);

                if(!isOnSite) {
                    self.meta.byline(og.site_name || urlHost(url).replace(/^www\./, ''));
                    self.meta.showByline(true);
                }

                self.updateEditorsDisplay();
            })
            .fail(function() {
                self.meta.headline(undefined);
            });
        };

        Article.prototype.open = function(article, evt) {
            if (this.uneditable) { return; }

            if (this.meta.supporting) { this.meta.supporting.items().forEach(function(sublink) { sublink.close(); }); }

            if (!this.state.isOpen()) {
                if (this.editors().length === 0) {
                    this.editors(metaFields.map(this.metaEditor, this).filter(function (editor) { return editor; }));
                }
                this.state.isOpen(true);
                mediator.emit(
                    'ui:open',
                    _.chain(this.editors())
                     .filter(function(editor) { return editor.type === 'text' && editor.displayEditor(); })
                     .map(function(editor) { return editor.meta; })
                     .first()
                     .value(),
                    this,
                    this.front
                );
            } else {
                mediator.emit('ui:open', null, null, this.front);
            }

            if ($(evt.target).hasClass('allow-default-click')) {
                return true;
            }
        };

        Article.prototype.close = function() {
            if (this.state.isOpen()) {
                this.state.isOpen(false);
                this.updateEditorsDisplay();
            }
            mediator.emit('ui:close', {
                targetGroup: this.group
            });
        };

        Article.prototype.closeAndSave = function() {
            this.close();
            this.save();
            return false;
        };

        Article.prototype.drop = function (source, targetGroup, alternateAction) {
            if (alternateAction) {
                // the drop target for replacing the article ID is the inner group
                return;
            }
            mediator.emit('collection:updates', {
                sourceItem: source.sourceItem,
                sourceGroup: source.sourceGroup,
                targetItem: this,
                targetGroup: targetGroup,
                isAfter: false,
                mediaItem: source.mediaItem,
                sourceContext: source.sourceItem.front,
                targetContext: this.front
            });
        };

        Article.prototype.validateImage = function (params) {
            var imageSrc = this.meta[params.src],
                imageSrcWidth = this.meta[params.width],
                imageSrcHeight = this.meta[params.height],
                image = imageSrc(),
                src,
                opts = params.options;


            if (image) {
                src = typeof image === 'string' ? image : (image.media ? image.media.file || image.origin : image.origin);
                validateImageSrc(src, opts)
                    .then(function(img) {
                        imageSrc(img.src);
                        imageSrcWidth(img.width);
                        imageSrcHeight(img.height);
                    }, function(err) {
                        undefineObservables(imageSrc, imageSrcWidth, imageSrcHeight);
                        alert(err.message);
                    });
            } else {
                undefineObservables(imageSrc, imageSrcWidth, imageSrcHeight);
            }
        };

        Article.prototype.validateListImage = function (params, meta) {
            var image = meta();

            if (image && image.src) {
                // This image is already validated
                return;
            } else if (image) {
                var originUrl = image.origin,
                    src = image.media ? image.media.file || originUrl : originUrl,
                    origin = image.media ? image.media.origin || originUrl : originUrl;
                validateImageSrc(src, params.options)
                    .then(function(img) {
                        meta(_.extend({
                            origin: origin
                        }, img));
                    }, function(err) {
                        undefineObservables(meta);
                        alert(err);
                    });
            } else {
                undefineObservables(meta);
            }
        };

        function getMainMediaType(contentApiArticle) {
            return _.chain(contentApiArticle.elements).where({relation: 'main'}).pluck('type').first().value();
        }

        function getPrimaryTag(contentApiArticle) {
            return _.chain(contentApiArticle.tags).pluck('webTitle').first().value();
        }

        function getContributorImage(contentApiArticle) {
            return _.chain(contentApiArticle.tags).where({type: 'contributor'}).pluck('bylineLargeImageUrl').first().value();
        }

        function isPremium(contentApiArticle) {
            return contentApiArticle.fields.membershipAccess === 'members-only' ||
                contentApiArticle.fields.membershipAccess === 'paid-members-only' ||
                !!_.find(contentApiArticle.tags, {id: 'news/series/looking-back'});
        }

        function undefineObservables() {
            Array.prototype.slice.call(arguments).forEach(function(fn) { fn(undefined); });
        }

        function mod(n, m) {
            return ((n % m) + m) % m;
        }

        function resize(el) {
            setTimeout(function() {
                el.style.height = (el.scrollHeight) + 'px';
            });
        }

        ko.bindingHandlers.autoResize = {
            init: function(el) {
                var resizeCallback = function () { resize(el); };
                resizeCallback();
                $(el).keydown(resizeCallback).on('paste', resizeCallback);
            }
        };

        ko.bindingHandlers.tabbableFormField = {
            init: function(el, valueAccessor, allBindings, viewModel, bindingContext) {
                var self = this;

                $(el).keydown(function(e) {
                    var keyCode = e.keyCode || e.which,
                        formField,
                        formFields,
                        nextIndex;

                    if (keyCode === 9) {
                        e.preventDefault();
                        formField = bindingContext.$rawData;
                        formFields = _.filter(bindingContext.$parent.editors(), function(ed) { return ed.type === 'text' && ed.displayEditor(); });
                        nextIndex = mod(formFields.indexOf(formField) + (e.shiftKey ? -1 : 1), formFields.length);
                        mediator.emit('ui:open', formFields[nextIndex].meta, self, self.front);
                    }
                });
            }
        };

        ko.bindingHandlers.dropImage = {
            init: function(el, valueAccessor, allBindings, viewModel, bindingContext) {
                var isDropEnabled = ko.unwrap(valueAccessor());

                if (isDropEnabled) {
                    el.addEventListener('drop', function (evt) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        bindingContext.$data.dropInEditor(evt.dataTransfer);
                        bindingContext.$data.underDrag(false);
                        resize(el);
                    });
                    el.addEventListener('dragover', function (evt) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        bindingContext.$data.underDrag(true);
                    });
                    el.addEventListener('dragleave', function (evt) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        bindingContext.$data.underDrag(false);
                    });
                    el.addEventListener('dragstart', function (evt) {
                        evt.dataTransfer.setData('sourceMeta', JSON.stringify(bindingContext.$data.meta()));
                    });
                }
            }
        };

        return Article;
    });
