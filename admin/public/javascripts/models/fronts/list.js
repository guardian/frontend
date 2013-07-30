define([
    'Reqwest',
    'knockout',
    'models/fronts/globals',
    'models/fronts/article',
    'models/fronts/contentApi'
], function(
    reqwest,
    ko,
    globals,
    Article,
    ContentApi
) {

    function List(id) {
        var self = this;

        this.id = id;
        this.crumbs = id.split(/\//g);

        this.live   = ko.observableArray();
        this.draft  = ko.observableArray();

        this.meta   = this.asObservableProps(['lastUpdated', 'updatedBy', 'updatedEmail']);
        this.config = this.asObservableProps(['contentApiQuery', 'min', 'max']);
        this.state  = this.asObservableProps(['liveMode', 'hasUnPublishedEdits', 'loadIsPending', 'editingConfig', 'timeAgo']);

        this.state.liveMode(globals.defaultToLiveMode);

        this.needsMore = ko.computed(function() {
            if (self.state.liveMode()  && self.live().length  < self.config.min()) { return true; }
            if (!self.state.liveMode() && self.draft().length < self.config.min()) { return true; }
            return false;
        });

        this.dropItem = function(item) {
            self.drop(item);
        };

        this.load();
    }

    List.prototype.asObservableProps = function(props) {
        return _.object(props.map(function(prop){
            return [prop, ko.observable()];
        }));
    };

    List.prototype.toggleShowSettings = function() {
        this.state.editingConfig(!this.state.editingConfig());
    };

    List.prototype.setLiveMode = function() {
        this.state.liveMode(true);
    };

    List.prototype.setDraftMode = function() {
        this.state.liveMode(false);
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
            url: globals.apiBase + '/' + this.id,
            method: 'post',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify(publish ? {publish: true} : {discard: true})
        }).then(
            function(resp) {
                self.load({
                    callback: function(){ self.state.liveMode(true); }
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
            url: globals.apiBase + '/' + self.id,
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                item: item.id(),
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
            url: globals.apiBase + '/' + this.id,
            type: 'json'
        }).always(
            function(resp) {
                self.populateMeta(resp);
                if (opts.isRefresh && (self.state.loadIsPending() || resp.lastUpdated === self.meta.lastUpdated())) { 
                    return;
                }
                self.populateData(resp);
                if (typeof opts.callback === 'function') { opts.callback(); } 
                self.state.loadIsPending(false);
            }
        );
    };

    List.prototype.populateMeta = function(opts) {
        var self = this;
        opts = opts || {};
        _.keys(this.meta).forEach(function(key){
            self.meta[key](opts[key]);
        });
        this.state.timeAgo(this.getTimeAgo(opts.lastUpdated));
    }

    List.prototype.populateData = function(opts) {
        var self = this;

        if (globals.uiBusy) { return; }
        opts = opts || {};

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
                opts[list].forEach(function(item) {
                    self[list].push(new Article({
                        id: item.id
                    }));
                });
                ContentApi.decorateItems(self[list]());
            }
        });

        // Only refresh config properties if they're not currently being edited
        if (!this.state.editingConfig()) {
            _.keys(this.config).forEach(function(key){
                self.config[key](opts[key]);
            });
        }

        this.state.hasUnPublishedEdits(opts.areEqual === false);
    };

    List.prototype.refresh = function() {
        if (globals.uiBusy || this.state.loadIsPending()) { return; }
        this.load({
            isRefresh: true
        });
    };

    List.prototype.saveConfig = function(key, val) {
        var self = this;
        reqwest({
            url: globals.apiBase + '/' + this.id,
            method: 'post',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ 
                config: {
                    contentApiQuery: this.config.contentApiQuery(),
                    min: parseInt(this.config.min(), 10) || undefined,
                    max: parseInt(this.config.max(), 10) || undefined
                }
            })
        }).always(function(){
            self.state.editingConfig(false);
        });
    };

    List.prototype.getTimeAgo = function(date) {
        return date ? humanized_time_span(date) : '';
    };

    return List;
});
