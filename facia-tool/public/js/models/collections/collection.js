define([
    'config',
    'knockout',
    'underscore',
    'jquery',
    'modules/vars',
    'utils/as-observable-props',
    'utils/fetch-visible-stories',
    'utils/human-time',
    'utils/mediator',
    'utils/populate-observables',
    'modules/authed-ajax',
    'modules/modal-dialog',
    'models/group',
    'models/collections/article',
    'modules/content-api'
], function(
    config,
    ko,
    _,
    $,
    vars,
    asObservableProps,
    fetchVisibleStories,
    humanTime,
    mediator,
    populateObservables,
    authedAjax,
    modalDialog,
    Group,
    Article,
    contentApi
) {
    function Collection(opts) {

        if (!opts || !opts.id) { return; }

        this.id = opts.id;

        this.front = opts.front;

        this.raw = undefined;

        this.groups = this.createGroups(opts.groups);

        this.alsoOn = opts.alsoOn || [];

        this.isDynamic = !!_.findWhere(vars.CONST.typesDynamic, {name: opts.type});

        this.dom = undefined;

        this.visibleStories = null;
        this.visibleCount = ko.observable({});

        this.listeners = mediator.scope();

        // properties from the config, about this collection
        this.configMeta   = asObservableProps([
            'type',
            'displayName',
            'uneditable']);
        populateObservables(this.configMeta, opts);

        // properties from the collection itself
        this.collectionMeta = asObservableProps([
            'displayName',
            'href',
            'lastUpdated',
            'updatedBy',
            'updatedEmail']);

        this.state  = asObservableProps([
            'lastUpdated',
            'hasConcurrentEdits',
            'collapsed',
            'hasDraft',
            'pending',
            'editingConfig',
            'count',
            'timeAgo',
            'alsoOnVisible',
            'showIndicators',
            'hasExtraActions',
            'isHistoryOpen']);

        this.itemDefaults = _.reduce({
            showTags: 'showKickerTag',
            showSections: 'showKickerSection'
        }, function(defaults, val, key) {
            if(_.has(opts, key)) {
                defaults = defaults || {};
                defaults[val] = opts[key];
            }
            return defaults;
        }, undefined);

        this.history = ko.observableArray();
        this.state.isHistoryOpen(this.front.confirmSendingAlert());

        this.setPending(true);
        this.load();

        var that = this;
        this.listeners.on('ui:open', function () {
            setTimeout(function () {
                that.refreshVisibleStories(true);
            }, 50);
        });
        this.listeners.on('ui:close', function () {
            that.refreshVisibleStories(true);
        });
    }

    Collection.prototype.setPending = function(asPending) {
        var self = this;

        if (asPending) {
            this.state.pending(true);
        } else {
            setTimeout(function() {
                self.state.pending(false);
            });
        }
    };

    Collection.prototype.isPending = function() {
        return !!this.state.pending();
    };

    Collection.prototype.createGroups = function(groupNames) {
        var self = this;

        return _.map(_.isArray(groupNames) ? groupNames : [undefined], function(name, index) {
            return new Group({
                index: index,
                name: name,
                parent: self,
                parentType: 'Collection',
                omitItem: self.drop.bind(self),
                front: self.front
            });
        }).reverse(); // because groupNames is assumed to be in ascending order of importance, yet should render in descending order
    };

    Collection.prototype.toggleCollapsed = function() {
        var collapsed = !this.state.collapsed();
        this.state.collapsed(collapsed);
        this.closeAllArticles();
        if (!collapsed) {
            this.refreshVisibleStories(true);
        }
        mediator.emit('collection:collapse', this, collapsed);
    };

    Collection.prototype.toggleEditingConfig = function() {
        this.state.editingConfig(!this.state.editingConfig());
    };

    Collection.prototype.reset = function() {
        this.closeAllArticles();
        this.state.editingConfig(false);
        this.load();
    };

    Collection.prototype.addedInDraft = function () {
        var live = (this.raw || {}).live || [];

        return _.chain(this.groups)
            .map(function (group) {
                return group.items();
            })
            .flatten()
            .filter(function (draftArticle) {
                return !_.find(live, function (liveArticle) {
                    return liveArticle.id === draftArticle.id();
                });
            })
            .value();
    };

    Collection.prototype.publishDraft = function() {
        var that = this,
            addedInDraft = this.front.confirmSendingAlert() ? this.addedInDraft() : [];

        if (addedInDraft.length) {
            modalDialog.confirm({
                name: 'confirm_breaking_changes',
                data: {
                    articles: this.addedInDraft(),
                    target: this.configMeta.displayName()
                }
            })
            .done(function () {
                that.processDraft(true);
            });
        } else {
            this.processDraft(true);
        }
    };

    Collection.prototype.discardDraft = function() {
        this.processDraft(false);
    };

    Collection.prototype.processDraft = function(goLive) {
        var self = this;

        this.state.hasDraft(false);
        this.setPending(true);
        this.closeAllArticles();

        authedAjax.request({
            type: 'post',
            url: vars.CONST.apiBase + '/collection/'+ (goLive ? 'publish' : 'discard') + '/' + this.id
        })
        .then(function() {
            self.load()
            .then(function(){
                if (goLive) {
                    mediator.emit('presser:detectfailures', self.front.front());
                }
            });
        });
    };

    Collection.prototype.drop = function(item) {
        var front = this.front;
        this.setPending(true);

        this.state.showIndicators(false);
        authedAjax.updateCollections({
            remove: {
                collection: this,
                item:       item.id(),
                mode:       front.mode()
            }
        })
        .then(function() {
            if (front.mode() === 'live') {
                mediator.emit('presser:detectfailures', front.front());
            }
        });
    };

    Collection.prototype.load = function(opts) {
        var self = this;

        opts = opts || {};

        return authedAjax.request({
            url: vars.CONST.apiBase + '/collection/' + this.id
        })
        .done(function(raw) {
            if (opts.isRefresh && self.isPending()) { return; }

            if (!raw) { return; }

            self.state.hasConcurrentEdits(false);

            self.populate(raw);

            populateObservables(self.collectionMeta, raw);

            self.collectionMeta.updatedBy(raw.updatedEmail === config.email ? 'you' : raw.updatedBy);

            self.state.timeAgo(self.getTimeAgo(raw.lastUpdated));
        })
        .always(function() {
            self.setPending(false);
        });
    };

    Collection.prototype.registerElement = function (element) {
        this.dom = element;
    };

    Collection.prototype.hasOpenArticles = function() {
        return _.some(this.groups, function(group) {
            return _.some(group.items(), function(article) { return article.state.isOpen(); });
        });
    };

    Collection.prototype.isHistoryEnabled = function () {
        return this.front.mode() !== 'treats' && this.history().length;
    };


    Collection.prototype.populate = function(rawCollection) {
        var self = this,
            list;

        this.raw = rawCollection || this.raw;

        if (this.raw) {
            this.state.hasDraft(_.isArray(this.raw.draft));

            if (this.hasOpenArticles()) {
                this.state.hasConcurrentEdits(this.raw.updatedEmail !== config.email && this.state.lastUpdated());

            } else if (!rawCollection || this.raw.lastUpdated !== this.state.lastUpdated()) {
                list = this.front.getCollectionList(this.raw);

                _.each(this.groups, function(group) {
                    group.items.removeAll();
                });

                _.each(list, function(item) {
                    var group = _.find(self.groups, function(g) {
                        return (parseInt((item.meta || {}).group, 10) || 0) === g.index;
                    }) || self.groups[0];

                    group.items.push(
                        new Article(_.extend(item, {
                            group: group,
                            slimEditor: self.front.slimEditor()
                        }))
                    );
                });

                this.populateHistory(this.raw.previously);
                this.state.lastUpdated(this.raw.lastUpdated);
                this.state.count(list.length);
                this.decorate();
            }
        }

        this.refreshVisibleStories();
        this.setPending(false);
    };

    Collection.prototype.populateHistory = function(list) {
        if (!list || list.length === 0) {
            return;
        }
        this.state.hasExtraActions(true);

        list = list.slice(0, this.front.maxArticlesInHistory);
        this.history(_.map(list, function (opts) {
            return new Article(_.extend(opts, {
                uneditable: true,
                slimEditor: this.front.slimEditor()
            }));
        }, this));
    };

    Collection.prototype.closeAllArticles = function() {
        _.each(this.groups, function(group) {
            _.each(group.items(), function(item) {
                item.close();
            });
        });
    };

    Collection.prototype.decorate = function() {
        _.each(this.groups, function(group) {
            contentApi.decorateItems(group.items());
        });
        contentApi.decorateItems(this.history());
    };

    Collection.prototype.refresh = function() {
        if (this.isPending()) { return; }

        this.load({
            isRefresh: true
        });
    };

    Collection.prototype.refreshSparklines = function() {
        _.each(this.groups, function(group) {
            _.each(group.items(), function(item) {
                item.loadSparkline();
            });
        });
    };

    Collection.prototype.refreshRelativeTimes = function() {
        _.each(this.groups, function(group) {
            _.each(group.items(), function(item) {
                item.setRelativeTimes();
            });
        });
    };

    Collection.prototype.refreshVisibleStories = function (stale) {
        if (!this.front.showIndicatorsEnabled()) {
            return this.state.showIndicators(false);
        }
        if (!stale || !this.visibleStories) {
            this.visibleStories = fetchVisibleStories(
                this.configMeta.type(),
                this.groups
            );
        }
        this.visibleStories.then(
            this.updateVisibleStories.bind(this),
            this.updateVisibleStories.bind(this, false)
        );
    };

    Collection.prototype.getTimeAgo = function(date) {
        return date ? humanTime(date) : '';
    };

    Collection.prototype.alsoOnToggle = function () {
        this.state.alsoOnVisible(!this.state.alsoOnVisible());
    };

    Collection.prototype.updateVisibleStories = function (numbers) {
        var container = this.dom;
        if (!container || !numbers || this.state.collapsed()) {
            this.state.showIndicators(false);
            return;
        }

        this.state.showIndicators(true);
        this.visibleCount(numbers);
    };

    Collection.prototype.dispose = function () {
        this.listeners.dispose();
    };

    ko.bindingHandlers.indicatorHeight = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var target = ko.unwrap(valueAccessor()),
                numbers = bindingContext.$data.visibleCount(),
                container = bindingContext.$data.dom,
                top, bottomElementPosition, bottomElement, bottom, height;

            if (!(target in numbers) || !container) {
                return;
            }

            top = $(element).parents('.article-group')[0].getBoundingClientRect().top;
            bottomElementPosition = numbers[target] - 1;
            bottomElement = bottomElementPosition >= 0 ? container.querySelectorAll('.article')[bottomElementPosition] : null;
            bottom = bottomElement ? bottomElement.getBoundingClientRect().bottom : NaN;
            height = bottom - top - 15;

            element.style.height = (height || 0) + 'px';
        }
    };

    return Collection;
});
