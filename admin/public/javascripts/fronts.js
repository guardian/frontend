curl(['Reqwest', 'bean', 'bonzo', 'js!html5sortable']).then(function(reqwest, bean, bonzo) {

    var doc = document,
        searchSelector = '.top-stories__search',
        addArticle = function(article) {
            bonzo(doc.querySelector('.top-stories__articles'))
                .append('<li>' + article + '<button class="btn btn-danger">X</button></li>');
            $('.top-stories__articles').sortable();
        };

    reqwest({
        url: '/fronts/top-stories',
        type: 'json'
    }).then(
        function(resp) {
            if (resp.articles) {
                resp.articles.forEach(function(article) {
                    addArticle(article.id);
                });
            }
        }
    );
    
    bean.one(doc.querySelector(searchSelector), 'keydown', function() {
        $(searchSelector).typeahead({
            matcher: function() { 
                return true; 
            },
            sorter: function(items) { 
                return items; 
            },
            updater: function(item) {
                addArticle(item);
            },
            source: function(query, process) {
                reqwest({
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'search',
                    url: 'http://content.guardianapis.com/search?format=json&show-fields=all&pageSize=5&q=' + query,
                    type: 'jsonp',
                    success: function(resp) {
                        var articles = resp.response.results.map(function(article) {
                            return article.webTitle;
                        });
                        process(articles);
                    }
                })
            }
        });
    })
    
    bean.on(doc.querySelector('.top-stories__save'), 'click', function(e) {
        var articles = Array.prototype.map.call(doc.querySelectorAll('.top-stories__articles li'), function(li) {
            return li.textContent;
        })
        reqwest({
            contentType: 'application/json',
            url: '/fronts/top-stories',
            method: 'post',
            data: JSON.stringify({
                articles: articles.map(function(article) {
                    return {
                        id: article
                    };
                })
            })
        });
    });
    
});
