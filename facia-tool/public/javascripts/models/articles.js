define(['models/article', 'knockout', 'Common', 'Reqwest'], function (Article, ko, Common, Reqwest) {

    return function(opts) {

        var self = this,
            deBounced,
            opts = opts || {};

        this.articles   = ko.observableArray();
        this.term       = ko.observable(Common.queryParams.q || '');
        this.section    = ko.observable();

        var reqwest = opts.reqwest || Reqwest;
        
        this.isTermAnItem = function() {
            return self.term().match(/\//);
        }

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
                    url  = '/api/proxy/search?show-fields=all&page-size=50&format=json&q=';
                    url += encodeURIComponent(self.term());
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
    };
});


