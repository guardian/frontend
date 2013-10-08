define([
    'Reqwest',
    'models/common',
    'models/cache'
],
function (
    Reqwest,
    common,
    cache
){
    function decorateItems (items) {
        var fetch = [];

        items.forEach(function(item){
            var data = cache.get('contentApi', item.meta.id());
            if(data) {
                decorateItem(data, item);
            } else {
                fetch.push(item.meta.id());
            }
        });

        fetchData(fetch, function(results){
            results.forEach(function(article){
                if (article.id) {
                    cache.put('contentApi', article.id, article);
                    _.filter(items,function(item){
                        return item.meta.id() === article.id;
                    }).forEach(function(item){
                        decorateItem(article, item);
                    });
                }
            });
        })
    };

    function decorateItem(fromObj, toKoObj) {
        toKoObj.populate(fromObj);
    }

    function fetchData(ids, callback) {
        var apiUrl;
        if (ids.length) {
            apiUrl = common.config.apiSearchBase + "/search?page-size=50&format=json&show-fields=all&show-tags=all";
            apiUrl += "&ids=" + ids.map(function(id){
                return encodeURIComponent(id);
            }).join(',');

            new Reqwest({
                url: apiUrl,
                type: 'jsonp'
            }).then(
                function(results) {
                    if (results.response && results.response.results) {
                        callback(results.response.results);
                    }
                },
                function(xhr) { console.log(xhr); } // error
            );
        }
    }

    return {
        decorateItems: decorateItems
    }

});
