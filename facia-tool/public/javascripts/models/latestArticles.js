define([
    'models/common',
    'models/article',
    'models/ophanApi',
    'models/cache',
    'models/authedAjax',
    'knockout'
], function (
    common,
    Article,
    ophanApi,
    cache,
    authedAjax,
    ko
) {
    return function(opts) {

        var page = 1,
            self = this,
            deBounced,
            opts = opts || {},
            container = document.querySelector('#latest-articles');

        this.articles   = ko.observableArray();
        this.term       = ko.observable(common.util.queryParams().q || '');
        this.section    = ko.observable('');
        this.page       = ko.observable(1);

        this.isTermAnItem = function() {
            return self.term().match(/\//);
        }

        this.term.subscribe(function(){ self.search({flushFirst: true}); });
        this.section.subscribe(function(){ self.search({flushFirst: true}); });

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
                    var url = '/api/proxy/' + self.term() + '?show-fields=all&format=json';
                    propName = 'content';
                } else {
                    url  = '/api/proxy/search?show-fields=all&format=json';
                    url += '&page-size=' + (common.config.searchPageSize || 25);
                    url += '&page=' + self.page();
                    url += '&q=' + encodeURIComponent(self.term());
                    url += '&section=' + encodeURIComponent(self.section());
                    propName = 'results';
                }

                authedAjax(
                    {
                        url: url,
                        dataType: 'json'
                    },
                    function(data) {
                        var rawArticles = data.response && data.response[propName] ? data.response[propName] : [];

                        self.flush();

                        ([].concat(rawArticles)).forEach(function(article, index){
                            article.index = index;
                            self.articles.push(new Article(article));
                            cache.put('contentApi', article.id, article);
                        })

                        ophanApi.decorateItems(self.articles());
                    }
                );

            }, 250);

            return true; // ensure default click happens on all the bindings
        };

        this.flush = function(message) {
            self.articles.removeAll();
            // clean up any dragged-in articles
            container.innerHTML = message || '';
        }

        this.refresh = function() {
            self.page(1);
            self.search();
        }

        this.pageNext = function() {
            self.page(self.page() + 1);
            self.search();
        }

        this.pagePrev = function() {
            self.page(_.max([1, self.page() - 1]));
            self.search();
        }

        this.startPoller = function() {
            setInterval(function(){
                if (self.page() === 1) {
                    self.search({noFlushFirst: true});
                }
            }, common.config.latestArticlesPollMs || 60000);

            this.startPoller = function() {}; // make idempotent
        }

    };
});


