define([
    'Reqwest',
    'EventEmitter',
    'knockout',
    'models/fronts/common',
    'models/fronts/article',
    'models/fronts/contentApi',
    'models/fronts/ophanApi'
], function(
    reqwest,
    eventEmitter,
    ko,
    common,
    Article,
    contentApi,
    ophanApi
) {

    function List(opts) {
        var self = this;

        opts = opts || {};

        if (!opts.id) { return; }

        this.id      = opts.id;
        this.edition = opts.id.split('/')[0];
        this.section = opts.id.split('/')[1];

        this.live   = ko.observableArray();
        this.draft  = ko.observableArray();

        // properties from the config, about this collection
        this.configMeta   = common.util.asObservableProps([
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

        this.needsMore = ko.computed(function() {
            if (self.state.liveMode()  && self.live().length  < self.configMeta.min()) { return true; }
            if (!self.state.liveMode() && self.draft().length < self.configMeta.min()) { return true; }
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

    List.prototype.cancelEditingConfig = function() {
        this.state.editingConfig(false);
        this.load();
    };

    List.prototype.setMode = function(isLiveMode) {
        this.state.liveMode(isLiveMode);
        this.decorate();
    };

    List.prototype.setLiveMode = function() {
        this.setMode(true);
    };

    List.prototype.setDraftMode = function() {
        this.setMode(false);
    };

    List.prototype.publishDraft = function() {
        this.processDraft(true);
    };

    List.prototype.discardDraft = function() {
        this.processDraft(false);
    };

    List.prototype.processDraft = function(goLive) {
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

    List.prototype.drop = function(item) {
        var self = this;
        self.live.remove(item);
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

    List.prototype.load = function(opts) {
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

                if (_.isFunction(opts.callback)) { opts.callback(); } 
            }
        );
    };

    List.prototype.populateLists = function(opts) {
        opts = opts || {};

        if (common.state.uiBusy) { return; }

        // Knockout doesn't seem to empty elements dragged into
        // a container when it regenerates its DOM content. So empty it first.
        this.containerEl = this.containerEl || $('[data-list-id="' + this.id + '"]');
        if (this.containerEl) {
            this.containerEl.empty();
        }

        this.importList(opts, 'live', 'live');
        this.importList(opts, this.state.hasDraft() ? 'draft' : 'live', 'draft');

        this.decorate();
    };

    List.prototype.importList = function(opts, from, to) {
        var self = this;

        if (self[to]) {
            self[to].removeAll();
        }
        if (opts[from]) {
            opts[from].forEach(function(item, index) {
                self[to].push(new Article({
                    id: item.id,
                    index: index,
                    webTitleOverride: item.webTitleOverride
                }));
            });
        }
    }

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

    List.prototype.getTimeAgo = function(date) {
        return date ? humanized_time_span(date) : '';
    };

    return List;
});
