define([
    'Reqwest',
    'knockout',
    'models/fronts/common',
    'models/fronts/article',
    'models/fronts/contentApi',
    'models/fronts/ophanApi'
], function(
    reqwest,
    ko,
    common,
    Article,
    contentApi,
    ophanApi
) {

    function List(id) {
        var self = this;

        this.id = id;
        this.crumbs = id.split(/\//g);

        this.live   = ko.observableArray();
        this.draft  = ko.observableArray();

        this.meta   = common.util.asObservableProps([
            'lastUpdated',
            'updatedBy',
            'updatedEmail']);
        this.config = common.util.asObservableProps([
            'contentApiQuery',
            'min',
            'max']);
        this.state  = common.util.asObservableProps([
            'liveMode',
            'hasUnPublishedEdits',
            'loadIsPending',
            'editingConfig',
            'timeAgo']);

        this.state.liveMode(common.config.defaultToLiveMode);

        this.needsMore = ko.computed(function() {
            if (self.state.liveMode()  && self.live().length  < self.config.min()) { return true; }
            if (!self.state.liveMode() && self.draft().length < self.config.min()) { return true; }
            return false;
        });

        this.dropItem = function(item) {
            self.drop(item);
        };

        this.saveItemConfig = function(item) {
            item.saveConfig(self.id);
            self.load();
        }

        this.forceRefresh = function() {
            self.load();
        }

        this.load();
    }

    List.prototype.toggleEditingConfig = function() {
        this.state.editingConfig(!this.state.editingConfig());
    };

    List.prototype.stopEditingConfig = function() {
        this.state.editingConfig(false);
    };

    List.prototype.setLiveMode = function() {
        this.state.liveMode(true);
        this.decorate();
    };

    List.prototype.setDraftMode = function() {
        this.state.liveMode(false);
        this.decorate();
    };

    List.prototype.publishDraft = function() {
        this.processDraft(true);
    };

    List.prototype.discardDraft = function() {
        this.processDraft(false);
    };

    List.prototype.processDraft = function(publish) {
        var self = this;

        reqwest({
            url: common.config.apiBase + '/' + this.id,
            method: 'post',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify(publish ? {publish: true} : {discard: true})
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
        this.state.hasUnPublishedEdits(false);
        this.state.loadIsPending(true);
    };

    List.prototype.drop = function(item) {
        var self = this;
        self.live.remove(item);
        self.state.loadIsPending(true);
        reqwest({
            method: 'delete',
            url: common.config.apiBase + '/' + self.id,
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                item: item.meta.id(),
                live: self.state.liveMode(),
                draft: true
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

    List.prototype.load = function(opts) {
        var self = this;
        opts = opts || {};

        reqwest({
            url: common.config.apiBase + '/' + this.id,
            type: 'json'
        }).always(
            function(resp) {
                self.state.loadIsPending(false);

                if (opts.isRefresh && (self.state.loadIsPending() || resp.lastUpdated === self.meta.lastUpdated())) { 
                    // noop    
                } else {
                    self.populateLists(resp);
                }

                if (resp.lastUpdated !== self.meta.lastUpdated()) {
                    self.populateMeta(resp);
                }

                if (!self.state.editingConfig()) {
                    self.populateConfig(resp);
                }

                if (_.isFunction(opts.callback)) { opts.callback(); } 
            }
        );
    };

    List.prototype.populateMeta = function(opts) {
        common.util.populateObservables(this.meta, opts)
        this.state.timeAgo(this.getTimeAgo(opts.lastUpdated));
    }

    List.prototype.populateConfig = function(opts) {
        common.util.populateObservables(this.config, opts)
    };

    List.prototype.populateLists = function(opts) {
        var self = this;
        

        opts = opts || {};

        if (common.state.uiBusy) { return; }

        // Knockout doesn't seem to empty elements dragged into
        // a container when it regenerates its DOM content. So empty it first.
        this.containerEl = this.containerEl || $('[data-list-id="' + this.id + '"]');
        if (this.containerEl) {
            this.containerEl.empty();
        }

        ['live', 'draft'].forEach(function(list){
            if (self[list]) {
                self[list].removeAll();
            }
            if (opts[list] && opts[list].length) {
                opts[list].forEach(function(item, index) {
                    self[list].push(new Article({
                        id: item.id,
                        index: index,
                        webTitleOverride: item.webTitleOverride
                    }));
                });
            }
        });

        self.decorate();
        this.state.hasUnPublishedEdits(opts.areEqual === false);
    };

    List.prototype.decorate = function() {
        var list = this[this.state.liveMode() ? 'live' : 'draft']();

        contentApi.decorateItems(list);
        ophanApi.decorateItems(list);
    };

    List.prototype.refresh = function() {
        if (common.state.uiBusy || this.state.loadIsPending()) { return; }
        this.load({
            isRefresh: true
        });
    };

    List.prototype.saveConfig = function() {
        var self = this;
        reqwest({
            url: common.config.apiBase + '/' + this.id,
            method: 'post',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ 
                config: {
                    contentApiQuery: this.config.contentApiQuery() || undefined,
                    min: parseInt(this.config.min(), 10) || undefined,
                    max: parseInt(this.config.max(), 10) || undefined
                }
            })
        }).always(function(){
            self.stopEditingConfig();
        });
    };

    List.prototype.getTimeAgo = function(date) {
        return date ? humanized_time_span(date) : '';
    };

    return List;
});
