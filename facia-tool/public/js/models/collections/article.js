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
                    key: 'group',
                    label: 'importance group',
                    type: 'text'
                },
                {
                    key: 'headline',
                    editable: true,
                    label: 'headline',
                    type: 'text',
                    maxLength: 90
                },
                {
                    key: 'trailText',
                    editable: true,
                    omitForSupporting: true,
                    label: 'trail text',
                    type: 'text'
                },
                {
                    key: 'byline',
                    editable: true,
                    requires: 'showByline',
                    omitForSupporting: true,
                    label: 'byline',
                    type: 'text'
                },
                {
                    key: 'customKicker',
                    editable: true,
                    requires: 'showKickerCustom',
                    label: 'custom kicker',
                    type: 'text'
                },
                {
                    key: 'href',
                    editable: true,
                    omitForSupporting: true,
                    requiresState: 'isSnap',
                    label: 'snap URL',
                    type: 'text'
                },
                {
                    key: 'imageSrc',
                    editable: true,
                    omitForSupporting: true,
                    requires: 'imageReplace',
                    label: 'replacement image URL',
                    validator: 'validateImageMain',
                    type: 'text'
                },
                {
                    key: 'imageSrcWidth',
                    requires: 'imageReplace',
                    label: 'replacement image width',
                    type: 'text'
                },
                {
                    key: 'imageSrcHeight',
                    requires: 'imageReplace',
                    label: 'replacement image height',
                    type: 'text'
                },
                {
                    key: 'imageCutoutSrc',
                    editable: true,
                    omitForSupporting: true,
                    requires: 'imageCutoutReplace',
                    label: 'replacement cutout image URL',
                    validator: 'validateImageCutout',
                    type: 'text'
                },
                {
                    key: 'imageCutoutSrcWidth',
                    requires: 'imageCutoutReplace',
                    label: 'replacement cutout image width',
                    type: 'text'
                },
                {
                    key: 'imageCutoutSrcHeight',
                    requires: 'imageCutoutReplace',
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
                    requiresState: 'inDynamicCollection',
                    label: 'boost',
                    type: 'boolean'
                },
                {
                    key: 'showMainVideo',
                    editable: true,
                    omitForSupporting: true,
                    requiresState: 'hasMainVideo',
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
                    key: 'isSnap',
                    label: 'is a snap',
                    type: 'boolean'
                },
                {
                    key: 'snapType',
                    requiresState: 'isSnap',
                    label: 'snap type',
                    type: 'text'
                },
                {
                    key: 'snapCss',
                    requiresState: 'isSnap',
                    label: 'snap CSS class',
                    type: 'text'
                },
                {
                    key: 'snapUri',
                    requiresState: 'isSnap',
                    label: 'snap source',
                    type: 'text'
                }
            ],

            rxScriptStriper = new RegExp(/<script.*/gi);

        function Article(opts, withCapiData) {
            var self = this;

            opts = opts || {};

            this.id = ko.observable(opts.id);

            this.group = opts.group;

            this.props = asObservableProps(capiProps);

            this.fields = asObservableProps(capiFields);

            this.meta = asObservableProps(_.pluck(metaFields, 'key'));
            populateObservables(this.meta, opts.meta);

            this.metaDefaults = {};

            this.collectionMetaDefaults = deepGet(opts, '.group.parent.itemDefaults');

            this.uneditable = opts.uneditable;

            this.state = asObservableProps([
                'underDrag',
                'isOpen',
                'isLoaded',
                'isEmpty',
                'isSnap',
                'inDynamicCollection',
                'tone',
                'primaryTag',
                'sectionName',
                'hasMainVideo',
                'imageCutoutSrcFromCapi',
                'ophanUrl',
                'sparkUrl']);

            this.state.isSnap(!!snap.validateId(opts.id));
            this.state.inDynamicCollection(deepGet(opts, '.group.parent.isDynamic'));

            this.frontPublicationDate = opts.frontPublicationDate;
            this.frontPublicationTime = ko.observable();
            this.scheduledPublicationTime = ko.observable();

            this.editors = ko.observableArray();

            this.editorsDisplay = ko.observableArray();

            this.headlineLength = ko.computed(function() {
                return (this.meta.headline() || this.fields.headline() || '').length;
            }, this);

            this.headlineLengthAlert = ko.computed(function() {
                return (this.meta.headline() || this.fields.headline() || '').length > vars.CONST.restrictedHeadlineLength;
            }, this);


            this.webPublicationTime = ko.computed(function(){
                return humanTime(this.props.webPublicationDate());
            }, this);

            this.viewUrl = ko.computed(function() {
                return this.fields.isLive() === 'false' ?
                    vars.CONST.previewBase + '/' + urlAbsPath(this.props.webUrl()) :
                    this.meta.href() || this.props.webUrl();
            }, this);

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

            if (withCapiData) {
                this.addCapiData(opts)
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

        Article.prototype.metaEditor = function(opts, index, all) {
            var self = this,
                key,
                meta,
                field;

            if(!opts.editable) { return; }

            key = opts.key;
            meta = self.meta[key] || function() {};
            field = self.fields[key] || function() {};

            if (opts.validator && _.isFunction(self[opts.validator])) {
                meta.subscribe(function() { self[opts.validator](); });
            }

            return {
                key:    key,

                label:  opts.label + (opts.labelState ? ': ' + _.result(this.state, opts.labelState) : ''),

                type:   opts.type,

                meta:   meta,

                field:  field,

                revert: function() { meta(undefined); },

                open:   function() { mediator.emit('ui:open', meta, self); },

                hasFocus: ko.computed(function() {
                    return meta === vars.model.uiOpenElement();
                }, self),

                displayEditor: ko.computed(function() {
                    var display = opts.requires ? _.some(all, function(editor) { return editor.key === opts.requires && self.meta[editor.key](); }) : true;

                    display = display && (opts.requiresState ? self.state[opts.requiresState]() : true);
                    display = display && (opts.omitForSupporting ? this.group.parentType !== 'Article' : true);

                    return display;
                }, self),

                toggle: function() {
                    if(opts.singleton) {
                       _.chain(all)
                        .filter(function(editor) { return editor.singleton === opts.singleton; })
                        .filter(function(editor) { return editor.key !== key; })
                        .pluck('key')
                        .each(function(key) { self.meta[key](false) })
                    }

                    meta(!meta());

                   _.chain(all)
                    .filter(function(editor) { return editor.requires === key; })
                    .first(1)
                    .each(function(editor) { mediator.emit('ui:open', self.meta[editor.key], self); });
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
                        meta(value === field() ? undefined : value.replace(rxScriptStriper, ''));
                    },
                    owner: self
                })
            }
        };

        Article.prototype.validateImageMain = function() {
            validateImage(
                this.meta.imageSrc,
                this.meta.imageSrcWidth,
                this.meta.imageSrcHeight,
                {
                    maxWidth: 1000,
                    minWidth: 500,
                    widthAspectRatio: 3,
                    heightAspectRatio: 5
                }
            )
        };

        Article.prototype.validateImageCutout = function() {
            validateImage(
                this.meta.imageCutoutSrc,
                this.meta.imageCutoutSrcWidth,
                this.meta.imageCutoutSrcHeight,
                {
                    maxWidth: 1000,
                    minWidth: 400
                }
            )
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
            ].filter(function(prop) {return !deepGet(opts, prop);});

            if (missingProps.length) {
                vars.model.alert('ContentApi is returning invalid data. Fronts may not update.');
                window.console.error('ContentApi missing: "' + missingProps.join('", "') + '" for ' + this.id());
            } else {
                this.state.isLoaded(true);
                this.state.sectionName(this.props.sectionName());
                this.state.primaryTag(getPrimaryTag(opts));
                this.state.imageCutoutSrcFromCapi(getContributorImage(opts));
                this.state.hasMainVideo(getMainMediaType(opts) === 'video');
                this.state.tone(opts.frontsMeta && opts.frontsMeta.tone);
                this.state.ophanUrl(vars.CONST.ophanBase + '?path=/' + urlAbsPath(opts.webUrl));

                this.metaDefaults = _.extend(deepGet(opts, '.frontsMeta.defaults') || {}, this.collectionMetaDefaults);

                populateObservables(this.meta, this.metaDefaults);

                this.updateEditorsDisplay();

                this.loadSparkline();
            }
        };

        Article.prototype.updateEditorsDisplay = function() {
            if (!this.uneditable) {
                this.editorsDisplay(metaFields.map(this.metaDisplayer, this).filter(function (editor) { return editor; }));
            }
        }

        Article.prototype.setRelativeTimes = function() {
            this.frontPublicationTime(humanTime(this.frontPublicationDate));
            this.scheduledPublicationTime(humanTime(this.fields.scheduledPublicationDate()));
        };

        Article.prototype.loadSparkline = function() {
            var self = this;

            if (vars.model.switches()['facia-tool-sparklines']) {
                setTimeout(function() {
                    if (self.state.sparkUrl()) {
                        self.state.sparkUrl.valueHasMutated();
                    } else {
                        self.state.sparkUrl(vars.sparksBase + urlAbsPath(self.props.webUrl()) + (self.frontPublicationDate ? '&markers=' + (self.frontPublicationDate/1000) + ':46C430' : ''));
                    }
                }, Math.floor(Math.random() * 5000));
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
                // trim and sanitize strings:
                .map(function(p){ return [p[0], sanitizeHtml(fullTrim(p[1]))]; })
                // reject vals that are equivalent to their defaults (if set) OR are falsey
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
            this.state.isSnap(true);
            this.meta.href(this.id());
            this.id(snap.generateId());
        };

        Article.prototype.open = function() {
            if (this.uneditable) { return; }

            this.meta.supporting && this.meta.supporting.items().forEach(function(sublink) { sublink.close(); });

            if (!this.state.isOpen()) {
                if (this.editors().length === 0) {
                    this.editors(metaFields.map(this.metaEditor, this).filter(function (editor) { return editor; }));
                }
                this.state.isOpen(true);
                mediator.emit('ui:open', this.meta.headline, this);
            } else {
                mediator.emit('ui:open');
            }
        };

        Article.prototype.close = function() {
            if (this.state.isOpen()) {
                this.state.isOpen(false);
                this.updateEditorsDisplay();
            }
        };

        Article.prototype.closeAndSave = function() {
            this.close();
            this.save();
            return false;
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

        function validateImage (imageSrc, imageSrcWidth, imageSrcHeight, opts) {
            if (imageSrc()) {
                validateImageSrc(imageSrc(), opts)
                    .done(function(width, height) {
                        imageSrcWidth(width);
                        imageSrcHeight(height);
                    })
                    .fail(function(err) {
                        undefineObservables(imageSrc, imageSrcWidth, imageSrcHeight);
                        window.alert(err);
                    });
            } else {
                undefineObservables(imageSrc, imageSrcWidth, imageSrcHeight);
            }
        };

        function undefineObservables() {
            Array.prototype.slice.call(arguments).forEach(function(fn) { fn(undefined); })
        };

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
                resize(el);
                $(el).keydown(function() { resize(el); });
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
                        formFields = _.filter(bindingContext.$parent.editors(), function(ed) { return ed.type === "text" && ed.displayEditor(); });
                        nextIndex = mod(formFields.indexOf(formField) + (e.shiftKey ? -1 : 1), formFields.length);
                        mediator.emit('ui:open', formFields[nextIndex].meta, self);
                    }
                });
            }
        };

        return Article;
    });
