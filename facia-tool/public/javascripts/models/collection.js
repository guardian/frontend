define([
    'Reqwest',
    'EventEmitter',
    'knockout',
    'models/common',
    'models/article',
    'models/contentApi',
    'models/ophanApi'
], function(
    reqwest,
    eventEmitter,
    ko,
    common,
    Article,
    contentApi,
    ophanApi
) {
    function Collection(opts) {
        var self = this;

        if (!opts || !opts.id) { return; }
        this.id = opts.id;

        this.live  = this.createGroups(opts.groups);
        this.draft = this.createGroups(opts.groups);

        // properties from the config, about this collection
        this.configMeta   = common.util.asObservableProps([
            'displayName',
            'min',
            'max',
            'roleName',
            'roleDescription']);
        common.util.populateObservables(this.configMeta, opts);

        // properties from the collection itself
        this.collectionMeta = common.util.asObservableProps([
            'displayName',
            'lastUpdated',
            'updatedBy',
            'updatedEmail']);

        this.state  = common.util.asObservableProps([
            'liveMode',
            'hasDraft',
            'loadIsPending',
            'editingConfig',
            'timeAgo']);
        this.state.liveMode(common.config.defaultToLiveMode);

        this.saveItemConfig = function(item) {
            item.saveConfig(self.id);
            self.load();
        }

        this.forceRefresh = function() {
            self.load();
        }

        this.load();
    }

    Collection.prototype.createGroups = function(groupNames) {
        var dropItem = this.drop.bind(this);

        return _.map(_.isArray(groupNames) ? groupNames : [undefined], function(name, index) {
            return {
                group: index,
                name: name,
                articles: ko.observableArray(),
                dropItem: dropItem
            };
        }).reverse(); // because groupNames is assumed to be in ascending order of importance, yet should render in descending order
    };

    Collection.prototype.toggleEditingConfig = function() {
        this.state.editingConfig(!this.state.editingConfig());
    };

    Collection.prototype.cancelEditingConfig = function() {
        this.state.editingConfig(false);
        this.load();
    };

    Collection.prototype.setMode = function(isLiveMode) {
        this.state.liveMode(isLiveMode);
        this.decorate();
    };

    Collection.prototype.setLiveMode = function() {
        this.setMode(true);
    };

    Collection.prototype.setDraftMode = function() {
        this.setMode(false);
    };

    Collection.prototype.publishDraft = function() {
        this.processDraft(true);
    };

    Collection.prototype.discardDraft = function() {
        this.processDraft(false);
    };

    Collection.prototype.processDraft = function(goLive) {
        var self = this;

        reqwest({
            url: common.config.apiBase + '/collection/' + this.id,
            method: 'post',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify(goLive ? {publish: true} : {discard: true})
        }).then(
            function(resp) {
                self.load({
                    callback: function(){ self.setLiveMode(); }
                });
            },
            function(xhr) {
                self.state.loadIsPending(false);
            }
        );
        this.state.hasDraft(false);
        this.state.loadIsPending(true);
    };

    Collection.prototype.drop = function(item) {
        var self = this;

        self.state.loadIsPending(true);
        reqwest({
            method: 'delete',
            url: common.config.apiBase + '/collection/' + self.id,
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                item: item.meta.id(),
                live:   self.state.liveMode(),
                draft: !self.state.liveMode()
            })
        }).then(
            function(resp) {
                self.load();
            },
            function(xhr) {
                self.state.loadIsPending(false);
            }
        );
    };

    Collection.prototype.load = function(opts) {
        var self = this;
        opts = opts || {};

        reqwest({
            url: common.config.apiBase + '/collection/' + this.id,
            type: 'json'
        }).always(
            function(resp) {
                self.state.loadIsPending(false);

                self.state.hasDraft(_.isArray(resp.draft));

                if (opts.isRefresh && (self.state.loadIsPending() || resp.lastUpdated === self.collectionMeta.lastUpdated())) {
                    // noop
                } else {
                    self.populateLists(resp);
                }

                if (!self.state.editingConfig()) {
                    common.util.populateObservables(self.collectionMeta, resp)
                    self.state.timeAgo(self.getTimeAgo(resp.lastUpdated));
                }

                self.decorate();

                if (_.isFunction(opts.callback)) { opts.callback(); }
            }
        );
    };

    Collection.prototype.populateLists = function(opts) {
        if (common.state.uiBusy) { return; }

        // Knockout doesn't flush elements previously dragged into containers when it regenerates their DOM content.
        // So, find then manually empty the containers.
        this.elements = this.elements || $('[data-collection="' + this.id + '"]');
        this.elements.empty();

        this.importList(opts.live, this.live);
        this.importList(opts.draft || opts.live, this.draft);
    };

    Collection.prototype.importList = function(source, groups) {
        var self = this;

        _.each(groups, function(group) {
            group.articles.removeAll();
        });

        _.toArray(source).forEach(function(item, index) {
            var group;

            // FAKE a group - for testing.
            item.group = Math.max(0, 2 - Math.floor(index/2));

            group = _.find(groups, function(g){ return g.group === item.group; }) || groups[0];
            group.articles.push(new Article(item));
        });
    }

    Collection.prototype.decorate = function() {
        _.each(this[this.state.liveMode() ? 'live' : 'draft'], function(group) {
            contentApi.decorateItems(group.articles());
            ophanApi.decorateItems(group.articles());
        });
    };

    Collection.prototype.refresh = function() {
        if (common.state.uiBusy || this.state.loadIsPending()) { return; }
        this.load({
            isRefresh: true
        });
    };

    Collection.prototype.saveConfig = function() {
        var self = this;

        this.state.editingConfig(false);
        this.state.loadIsPending(true);

        reqwest({
            url: common.config.apiBase + '/collection/' + this.id,
            method: 'post',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                config: {
                    displayName: this.collectionMeta.displayName()
                }
            })
        }).always(function(){
            self.load();
        });
    };

    Collection.prototype.getTimeAgo = function(date) {
        return date ? humanized_time_span(date) : '';
    };

    return Collection;
});
