define([
    'Reqwest',
    'knockout',
    'models/fronts/article',
    'models/fronts/contentApi'
], function(
    reqwest,
    knockout,
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

        this.liveEdit     = knockout.observable(liveEditDefault);
        this.hasUnPublishedEdits = knockout.observable();

        this.dropItem = function(item) {
            reqwest({
                method: 'delete',
                url: apiBase + '/' + self.id + '/' + item.id()
            });
            self.live.remove(item);
        }

        this.load();
    }

    List.prototype.setLiveEdit = function() {
        this.liveEdit(true);
    };

    List.prototype.setDraftEdit = function() {
        this.liveEdit(false);
    };

    List.prototype.load = function() {
        var self = this;
        reqwest({
            url: apiBase + '/' + this.id,
            type: 'json'
        }).then(
            function(resp) {
                self.populate(resp);
            },
            function(xhr) {
                if(xhr.status === 404) {
                    self.populate({});
                }
            }
        );
    };

    List.prototype.populate = function(opts) {
        var self = this,
            liveChecksum = '',
            draftChecksum = '';

        // Knockout doesn't seem to empty elements dragged into
        // a container when it regenerates its DOM content. So empty it first.
        this.containerEl = this.containerEl || $('[data-list-id="' + this.id + '"]');
        if (this.containerEl) {
            this.containerEl.empty();
        }

        this.live.removeAll();
        //Change trails to live
        [].concat(opts.trails).forEach(function(item) {
            self.live.push(new Article({
                id: item.id
            }));
            liveChecksum += item.id + ':';
        });

        this.draft.removeAll();
        //Change trails to draft
        [].concat(opts.trails).forEach(function(item) {
            self.draft.push(new Article({
                id: item.id
            }));
            draftChecksum += item.id + ':';
        });

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
