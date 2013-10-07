define([
    'models/common',
    'models/autoComplete',
    'models/article',
    'models/ophanApi',
    'models/cache',
    'knockout',
    'Reqwest'
], function (
    common,
    autoComplete,
    Article,
    ophanApi,
    cache,
    ko,
    Reqwest
) {
    return function(opts) {

        var self = this,
            deBounced,
            opts = opts || {},
            container = document.querySelector('#latest-articles');

        this.articles   = ko.observableArray();

        this.term       = ko.observable(common.util.queryParams().q || '');
        this.suggestions= ko.observableArray();

        this.filter     = ko.observable();
        this.filterType = ko.observable();
        this.filterTypes= ko.observableArray(_.values(opts.filterTypes) || []),

        this.page       = ko.observable(1);

        var reqwest = opts.reqwest || Reqwest;

        this.isTermAnItem = function() {
            return (self.term() || '').match(/\//);
        }

        this.term.subscribe(function(value){
            self.search({
                flushFirst: true
            });
        });

        this.setFilter = function(item) {
            self.filter(item && item.id ? item.id : item);
            self.suggestions.removeAll();
            self.search({
                flushFirst: true
            });
        };

        this.clearFilter = function() {
            self.filter('');
            self.suggestions.removeAll();
        };

        this.setSection = function(str) {
            self.filterType(opts.filterTypes.section);
            self.setFilter(str);
            self.clearTerm();
        };

        this.clearTerm = function() {
            this.term('');
        };

        this.autoComplete = function() {
            autoComplete({
                query:    self.filter(),
                path:    (self.filterType() || {}).path,
                receiver: self.suggestions
            });
        };

        // Grab articles from Content Api
        this.search = function(opts) {
            opts = opts || {};

            clearTimeout(deBounced);
            deBounced = setTimeout(function(){

                var url, propName;

                if (!opts.noFlushFirst) {
                    self.flush('searching...');
                };

                // If term contains slashes, assume it's an article id (and first convert it to a path)
                if (self.isTermAnItem()) {
                    self.term(common.util.urlAbsPath(self.term()));
                    url = common.config.apiSearchBase + '/' + self.term() + '?show-fields=all&format=json';
                    propName = 'content';
                } else {
                    url  = common.config.apiSearchBase + '/search?show-fields=all&format=json';
                    url += '&page-size=' + (common.config.searchPageSize || 25);
                    url += '&page=' + self.page();
                    url += '&q=' + encodeURIComponent(self.term());
                    url += '&' + self.filterType().param + '=' + encodeURIComponent(self.filter());
                    propName = 'results';
                }

                reqwest({
                    url: url,
                    type: 'jsonp',
                    success: function(resp) {
                        var rawArticles = resp.response && resp.response[propName] ? resp.response[propName] : [];

                        self.flush(rawArticles.length === 0 ? "...sorry, no articles were found." : "");

                        ([].concat(rawArticles)).forEach(function(article, index){
                            article.index = index;
                            self.articles.push(new Article(article));
                            cache.put('contentApi', article.id, article);
                        })

                        ophanApi.decorateItems(self.articles());
                    },
                    error: function() {}
                });
            }, 250);

            return true; // ensure default click happens on all the bindings
        };

        this.flush = function(message) {
            self.articles.removeAll();
            // clean up any dragged-in articles
            container.innerHTML = message || '';
        };

        this.refresh = function() {
            self.page(1);
            self.search();
        };

        this.pageNext = function() {
            self.page(self.page() + 1);
            self.search();
        };

        this.pagePrev = function() {
            self.page(_.max([1, self.page() - 1]));
            self.search();
        };

        this.startPoller = function() {
            setInterval(function(){
                if (self.page() === 1) {
                    self.search({noFlushFirst: true});
                }
            }, common.config.latestArticlesPollMs || 60000);

            this.startPoller = function() {}; // make idempotent
        };

    };
});


