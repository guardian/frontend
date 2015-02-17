define([
    'underscore',
    'modules/vars',
    'utils/internal-content-code',
    'utils/query-params',
    'utils/url-abs-path',
    'models/collections/article',
    'modules/auto-complete',
    'modules/cache',
    'modules/content-api',
    'knockout'
], function (
    _,
    vars,
    internalContentCode,
    queryParams,
    urlAbsPath,
    Article,
    autoComplete,
    cache,
    contentApi,
    ko
) {

    return function(options) {

        var self = this,
            deBounced,
            poller,
            opts = options || {},
            counter = 0,
            container = options.container.querySelector('.latest-articles'),
            scrollable = options.container.querySelector('.scrollable'),
            pageSize = vars.CONST.searchPageSize || 25;

        this.articles = ko.observableArray();

        this.term = ko.observable(queryParams().q || '');
        this.term.subscribe(function() { self.search(); });
        this.isTermAnItem = function() { return (self.term() || '').match(/\//); };

        this.filter     = ko.observable();
        this.filterType = ko.observable();
        this.filterTypes= ko.observableArray(_.values(opts.filterTypes) || []);

        this.showingDrafts = ko.observable(false);
        this.showDrafts = function() {
            self.showingDrafts(true);
            self.search();
        };
        this.showLive = function() {
            self.showingDrafts(false);
            self.search();
        };

        this.suggestions = ko.observableArray();
        this.lastSearch = ko.observable();

        this.page = ko.observable(1);
        this.totalPages = ko.observable(1);

        this.title = ko.computed(function () {
            var lastSearch = this.lastSearch(),
                title = 'latest';
            if (lastSearch && lastSearch.filter) {
                title += ' in ' + lastSearch.filter;
            }
            return title;
        }, this);

        this.setFilter = function(item) {
            self.filter(item && item.id ? item.id : item);
            self.suggestions.removeAll();
            self.filterChange();
            self.search();
        };

        this.clearFilter = function() {
            self.filter('');
            self.suggestions.removeAll();
        };

        this.clearTerm = function() {
            self.term('');
        };

        this.autoComplete = function() {
            autoComplete({
                query:    self.filter(),
                path:    (self.filterType() || {}).path
            })
            .progress(self.suggestions)
            .then(self.suggestions);
        };

        this.filterChange = function () {
            if (!this.filter()) {
                var lastSearch = this.lastSearch();
                if (lastSearch && lastSearch.filter) {
                    // The filter has been cleared
                    this.search();
                }
            }
        };

        function fetch (opts) {
            var count = counter += 1;

            opts = opts || {};

            if (!vars.model.switches()['facia-tool-draft-content']) {
                self.showingDrafts(false);
            }

            clearTimeout(deBounced);
            deBounced = setTimeout(function() {
                if (self.suggestions().length) {
                    // The auto complete is open, if we ask the API most likely we won't get any result
                    // which will lead to displaying the alert
                    return;
                }
                if (!opts.noFlushFirst) {
                    self.flush('searching...');
                }

                var request = {
                    isDraft: self.showingDrafts(),
                    page: self.page(),
                    pageSize: pageSize,
                    filter: self.filter(),
                    filterType: self.filterType().param
                };

                var term = self.term();
                // If term contains slashes, assume it's an article id (and first convert it to a path)
                if (self.isTermAnItem()) {
                    term = urlAbsPath(term);
                    self.term(term);
                    request.article = term;
                } else {
                    request.term = term;
                }

                contentApi.fetchLatest(request)
                .then(
                    function(response) {
                        if (count !== counter) { return; }
                        var rawArticles = response.results,
                            initialScroll = scrollable.scrollTop;

                        self.flush(rawArticles.length === 0 ? '...sorry, no articles were found.' : '');

                        var newArticles = [];
                        _.each(rawArticles, function(opts) {
                            var icc = internalContentCode(opts);

                            opts.id = icc;
                            cache.put('contentApi', icc, opts);

                            opts.uneditable = true;
                            newArticles.push(new Article(opts, true));
                        });
                        self.articles(newArticles);
                        self.lastSearch(request);
                        self.totalPages(response.pages);
                        self.page(response.currentPage);
                        scrollable.scrollTop = initialScroll;
                    },
                    function(error) {
                        var errMsg = error.message;
                        vars.model.alert(errMsg);
                        self.flush(errMsg);
                    }
                );
            }, 300);
        }

        // Grab articles from Content Api
        this.search = function(opts) {
            self.page(1);
            fetch(opts);

            return true; // ensure default click happens on all the bindings
        };

        this.flush = function(message) {
            self.articles.removeAll();
            // clean up any dragged-in articles
            container.innerHTML = message ? '<div class="search-message">' + message + '</div>' : '';
        };

        this.refresh = function() {
            self.page(1);
            fetch();
        };

        this.reset = function() {
            self.page(1);
            this.clearTerm();
            this.clearFilter();
        };

        this.pageNext = function() {
            self.page(self.page() + 1);
            fetch();
        };

        this.pagePrev = function() {
            self.page(_.max([1, self.page() - 1]));
            fetch();
        };

        this.showNext = ko.pureComputed(function () {
            return this.totalPages() > this.page();
        }, this);

        this.showPrev = ko.pureComputed(function () {
            return this.page() > 1;
        }, this);

        this.showTop = ko.pureComputed(function () {
            return this.page() > 2;
        }, this);

        this.startPoller = function() {
            poller = setInterval(function(){
                if (self.page() === 1) {
                    self.search({noFlushFirst: true});
                }
            }, vars.CONST.latestArticlesPollMs || 60000);

            this.startPoller = function() {}; // make idempotent
        };

        this.dispose = function () {
            clearTimeout(deBounced);
            clearInterval(poller);
        };

    };
});
