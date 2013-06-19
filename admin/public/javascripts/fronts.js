curl(['Reqwest', 'bean', 'bonzo', 'js!html5sortable']).then(function(reqwest, bean, bonzo) {

    var doc = document,
        searchSelector = '.top-stories__search'; 
    
    bean.one(doc.querySelector(searchSelector), 'keydown', function() {
        $(searchSelector).typeahead({
            matcher: function() { 
                return true; 
            },
            sorter: function(items) { 
                return items; 
            },
            updater: function(item) {
                bonzo(doc.querySelector('.top-stories__articles'))
                    .append('<li>' + item + '</li>');
                $('.top-stories__articles').sortable();
            },
            source: function(query, process) {
                reqwest({
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'search',
                    url: 'http://content.guardianapis.com/search?format=json&show-fields=all&pageSize=5&q=' + query,
                    type: 'jsonp',
                    success: function(resp) {
                        var articles = resp.response.results.map(function(a) {
                            return a.webTitle;
                        });
                        process(articles);
                    }
                })
            }
        });
    })
    
    bean.on(doc.querySelector('.top-stories__save'), 'click', function(e) {
        var topStories = Array.prototype.map.call(doc.querySelectorAll('.top-stories__articles li'), function(li) {
            return li.textContent;
        })
        reqwest({
            url: '/fronts/top-stories',
            method: 'post',
            data: {
                topStories: topStories
            } 
        });
    });
    
});
