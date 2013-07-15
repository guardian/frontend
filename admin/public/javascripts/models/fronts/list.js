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
    var apiBase = '/fronts/api';

    function List(id) {
        var self = this;

        this.id = id;
        this.crumbs = id.split(/\//g);

        this.list         = knockout.observableArray();
        this.lastUpdated  = knockout.observable();
        this.updatedBy    = knockout.observable();
        this.updatedEmail = knockout.observable();

        this.dropItem = function(item) {
            reqwest({
                method: 'delete',
                url: apiBase + '/' + self.id + '/' + item.id()
            });
            self.list.remove(item);
        }

        this.load();
    }

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
    }

    List.prototype.populate = function(opts) {
        var trails = opts.trails || [],
            self = this;

        // Knockout doesn't seem to empty elements dragged into
        // a container when it regenerates its DOM content. So empty it first.
        this.containerEl = this.containerEl || $('[data-list-id="' + this.id + '"]');
        if (this.containerEl) {
            this.containerEl.empty();
        }

        this.list.removeAll();
        trails.forEach(function(item) {
            self.list.push(new Article({
                id: item.id
            }));
        });
        ContentApi.decorateItems(this.list());

        this.lastUpdated(this.timeAgoString(opts.lastUpdated));
        this.updatedBy(opts.updatedBy);
        this.updatedEmail(opts.updatedEmail);
    }

    List.prototype.timeAgoString = function(date) {
        return date ? humanized_time_span(date) : '';
    }

    return List;
});
