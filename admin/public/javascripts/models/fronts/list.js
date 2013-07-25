define([
    'Reqwest',
    'knockout',
    'models/fronts/globals',
    'models/fronts/article',
    'models/fronts/contentApi'
], function(
    reqwest,
    knockout,
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

        this.live         = knockout.observableArray();
        this.draft        = knockout.observableArray();

        this.lastUpdated  = knockout.observable();
        this.timeAgo      = knockout.observable();
        this.updatedBy    = knockout.observable();
        this.updatedEmail = knockout.observable();

        this.min          = knockout.observable(opts.min || 1);
        this.max          = knockout.observable(opts.max || 50);

        this.liveMode     = knockout.observable(defaultToLiveMode);
        this.hasUnPublishedEdits = knockout.observable();
        this.loadIsPending = knockout.observable(false);

        this.needsMore = knockout.computed(function() {
            if (self.liveMode()  && self.live().length  < self.min()) { return true; }
            if (!self.liveMode() && self.draft().length < self.min()) { return true; }
            return false;
        });

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
                if (opts.isRefresh && (self.loadIsPending() || resp.lastUpdated === self.lastUpdated())) { 
                    return;
                }
                self.populateLists(resp || {});
                if (typeof opts.callback === 'function') { opts.callback(); } 
                self.loadIsPending(false);
            }
        );
    };

    List.prototype.refresh = function() {
        if (globals.uiBusy || this.loadIsPending()) { return; }
        this.load({
            isRefresh: true
        });
    };

    List.prototype.populateLists = function(opts) {
        var self = this;

        if (globals.uiBusy) { return; }

        this.lastUpdated(opts.lastUpdated);
        this.timeAgo(this.getTimeAgo(opts.lastUpdated));
        this.updatedBy(opts.updatedBy);
        this.updatedEmail(opts.updatedEmail);

        // Knockout doesn't seem to empty elements dragged into
        // a container when it regenerates its DOM content. So empty it first.
        this.containerEl = this.containerEl || $('[data-list-id="' + this.id + '"]');
        if (this.containerEl) {
            this.containerEl.empty();
        }

        this.live.removeAll();
        if (opts.live && opts.live.length) {
            opts.live.forEach(function(item) {
                self.live.push(new Article({
                    id: item.id
                }));
            });
        }

        this.draft.removeAll();
        if (opts.draft && opts.draft.length) {
            opts.draft.forEach(function(item) {
                self.draft.push(new Article({
                    id: item.id
                }));
            });
        }

        ContentApi.decorateItems(this.live());
        ContentApi.decorateItems(this.draft());

        this.hasUnPublishedEdits(opts.areEqual === false);
    };

    List.prototype.getTimeAgo = function(date) {
        return date ? humanized_time_span(date) : '';
    };

    return List;
});
