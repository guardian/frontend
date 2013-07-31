define([
    'models/fronts/article',
    'knockout',
    'Common',
    'Reqwest'
], function (
    Article,
    ko,
    Common,
    Reqwest
) {

    return function(opts) {

        var self = this,
            deBounced,
            opts = opts || {};

        this.articles   = ko.observableArray();
        this.term       = ko.observable(Common.queryParams.q || '');
        this.section    = ko.observable('');
        this.mostViewed = ko.observable(false);

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

                // If term contains slashes, assume it's an article id
                if (self.isTermAnItem()) {
                    var url = '/api/proxy/' + self.term() + '?show-fields=all&format=json';
                    propName = 'content';
                } else {
                    url  = '/api/proxy/search?show-fields=all&page-size=50&format=json';
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

                        // Make sure it's an array 
                        rawArticles = [].concat(rawArticles);

                        self.articles.removeAll();
                        rawArticles.map(function(a){
                            self.articles.push(new Article(a));
                        })
                    },
                    error: function() {}
                });
            }, 250);
            
            return true; // ensure default click happens on all the bindings
        };

        function _startPoller() {
            setInterval(function(){
                self.search();
            }, 10000);
        }

        this.startPoller = _.once(_startPoller);
    };
});


