define([
    'models/fronts/common',
    'models/fronts/article',
    'models/fronts/ophanApi',
    'models/fronts/cache',
    'knockout',
    'Reqwest'
], function (
    common,
    Article,
    ophanApi,
    cache,
    ko,
    Reqwest
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
        this.mostViewed = ko.observable(false);
        this.page       = ko.observable(1);

        var reqwest = opts.reqwest || Reqwest;
        
        this.isTermAnItem = function() {
            return self.term().match(/\//);
        }

        this.term.subscribe(function(){ self.search(); });
        this.section.subscribe(function(){ self.search(); });
        this.mostViewed.subscribe(function(){ self.search(); });

        // Grab articles from Content Api
        this.search = function() {
            clearTimeout(deBounced);
            deBounced = setTimeout(function(){

                var url, propName;

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
                    url += self.mostViewed() ? '&show-most-viewed=true' : '';
                    propName = 'results';
                }

                reqwest({
                    url: url,
                    type: 'jsonp',
                    success: function(resp) {
                        var rawArticles = resp.response && resp.response[propName] ? resp.response[propName] : [];

                        self.flush();

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
        }

        this.refresh = function() {
            self.flush('Searching...');
            self.page(1);
            self.search();
        }

        this.pageNext = function() {
            self.page(self.page() + 1);
            self.flush('Searching...');
            self.search();
        }

        this.pagePrev = function() {
            self.page(_.max([1, self.page() - 1]));
            self.flush('Searching...');
            self.search();
        }

        function _startPoller() {
            setInterval(function(){
                if (self.page() === 1) {
                    self.search();
                }
            }, 10000);
        }
        this.startPoller = _.once(_startPoller);

    };
});


