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
    var defaultToLiveMode = true,
        apiBase = '/fronts/api';

    function List(id, opts) {
        var self = this;

        this.id = id;
        this.crumbs = id.split(/\//g);

        this.live         = ko.observableArray();
        this.draft        = ko.observableArray();

        this.meta = {
            lastUpdated: ko.observable(),
            updatedBy: ko.observable(),
            updatedEmail: ko.observable()
        };

        this.config = {
            contentApiQuery: ko.observable(),
            min: ko.observable(),
            max: ko.observable()      
        };

        this.timeAgo = ko.observable();
        this.liveMode     = ko.observable(defaultToLiveMode);
        this.hasUnPublishedEdits = ko.observable();
        this.loadIsPending = ko.observable(false);
        this.editingConfig  = ko.observable(false);

        this.needsMore = ko.computed(function() {
            if (self.liveMode()  && self.live().length  < self.config.min()) { return true; }
            if (!self.liveMode() && self.draft().length < self.config.min()) { return true; }
            return false;
        });

        this.toggleShowSettings = function(){
            this.editingConfig(!this.editingConfig());
        };

        this.dropItem = function(item) {
            reqwest({
                method: 'delete',
                url: apiBase + '/' + self.id,
                type: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    item: item.id(),
                    live: self.liveMode(),
                    draft: true
                })
            }).then(
                function(resp) {
                    self.load();
                },
                function(xhr) {
                    self.loadIsPending(false);
                }
            );
            self.live.remove(item);
            self.loadIsPending(true);
        }

        this.load();
    }

    List.prototype.setLiveMode = function() {
        this.liveMode(true);
    };

    List.prototype.setDraftMode = function() {
        this.liveMode(false);
    };

    List.prototype.publishDraft = function() {
        this.processDraft(true);
    };

    List.prototype.discardDraft = function() {
        this.processDraft(false);
    };

    List.prototype.processDraft = function(publish) {
        var self = this,
            data = {};

        data[publish ? 'publish' : 'discard'] = true;
        reqwest({
            url: apiBase + '/' + this.id,
            method: 'post',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data)
        }).then(
            function(resp) {
                self.load({
                    callback: function(){ self.liveMode(true); }
                });
            },
            function(xhr) {
                self.loadIsPending(false);
            }
        );
        this.hasUnPublishedEdits(false);
        this.loadIsPending(true);
    };

    List.prototype.load = function(opts) {
        var self = this;

        opts = opts || {};
        reqwest({
            url: apiBase + '/' + this.id,
            type: 'json'
        }).always(
            function(resp) {
                self.populateMeta(resp);
                if (opts.isRefresh && (self.loadIsPending() || resp.lastUpdated === self.meta.lastUpdated())) { 
                    return;
                }
                self.populateData(resp);
                if (typeof opts.callback === 'function') { opts.callback(); } 
                self.loadIsPending(false);
            }
        );
    };

    List.prototype.populateMeta = function(opts) {
        var self = this;
        _.keys(this.meta).forEach(function(key){
            self.meta[key](opts[key]);
        });
        this.timeAgo(this.getTimeAgo(opts.lastUpdated));
    }

    List.prototype.populateData = function(opts) {
        var self = this;

        if (globals.uiBusy) { return; }

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

        if (!this.editingConfig()) {
            _.keys(this.config).forEach(function(key){
                self.config[key](opts[key]);
            });
        }

        this.hasUnPublishedEdits(opts.areEqual === false);
    };

    List.prototype.refresh = function() {
        if (globals.uiBusy || this.loadIsPending()) { return; }
        this.load({
            isRefresh: true
        });
    };

    List.prototype.saveConfig = function(key, val) {
        var self = this;
        reqwest({
            url: apiBase + '/' + this.id,
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
            self.editingConfig(false);
        });
    };

    List.prototype.getTimeAgo = function(date) {
        return date ? humanized_time_span(date) : '';
    };

    return List;
});
