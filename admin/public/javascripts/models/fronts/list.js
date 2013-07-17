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
    var liveEditDefault = true,
        apiBase = '/fronts/api';

    function List(id) {
        var self = this;

        this.id = id;
        this.crumbs = id.split(/\//g);

        this.live         = knockout.observableArray();
        this.draft        = knockout.observableArray();

        this.lastUpdated  = knockout.observable();
        this.updatedBy    = knockout.observable();
        this.updatedEmail = knockout.observable();

        this.liveMode     = knockout.observable(liveEditDefault);
        this.loadIsPending  = knockout.observable();
        this.hasUnPublishedEdits = knockout.observable();

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
                    console.log(xhr);
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
                self.loadIsPending(false);
            },
            function(xhr) {
                self.loadIsPending(false);
            }
        );
        this.hasUnPublishedEdits(false);
        this.loadIsPending(true);
    };

    List.prototype.load = function() {
        var self = this;
        reqwest({
            url: apiBase + '/' + this.id,
            type: 'json'
        }).then(
            function(resp) {
                self.populateLists(resp);
                self.loadIsPending(false);
            },
            function(xhr) {
                if(xhr.status === 404) {
                    self.populateLists({});
                }
                self.loadIsPending(false);
            }
        );
    };

    List.prototype.refresh = function() {
        if (globals.uiBusy) { return; }
        this.load();
    };

    List.prototype.populateLists = function(opts) {
        var self = this,
            liveChecksum = '',
            draftChecksum = '';

        if (globals.uiBusy) { return; }

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
                liveChecksum += item.id + ':';
            });
        }

        this.draft.removeAll();
        if (opts.draft && opts.draft.length) {
            opts.draft.forEach(function(item) {
                self.draft.push(new Article({
                    id: item.id
                }));
                draftChecksum += item.id + ':';
            });
        }

        this.hasUnPublishedEdits(liveChecksum !== draftChecksum);

        ContentApi.decorateItems(this.live());
        ContentApi.decorateItems(this.draft());

        this.lastUpdated(this.timeAgoString(opts.lastUpdated));
        this.updatedBy(opts.updatedBy);
        this.updatedEmail(opts.updatedEmail);
    };

    List.prototype.timeAgoString = function(date) {
        return date ? humanized_time_span(date) : '';
    };

    return List;
});
