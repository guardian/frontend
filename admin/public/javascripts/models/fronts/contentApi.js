define([
    'Config',
    'Common',
    'Reqwest',
    'models/fronts/globals'
], 
function (
    Config,
    Common,
    Reqwest,
    globals
){
    var cache = {};

    var decorateItems = function(items) {
        var fetch = [];

        items.forEach(function(item){
            var article = cache[item.id()];
            if(article) {
                decorateItem(article, item);
            } else {
                fetch.push(item.id());
            }
        });

        fetchArticles(fetch, function(results){
            results.forEach(function(result){
                if (result.id) {
                    cache[result.id] = result;
                    _.filter(items,function(item){
                        return item.id() === result.id;
                    }).forEach(function(item){
                        decorateItem(result, item);
                    });
                }
            });
        })
    };

    var decorateItem = function(fromObj, toKoObj) {
        toKoObj.init(fromObj);
    }

    var fetchArticles = function(ids, callback) {
        var apiUrl;
        if (ids.length) {
            apiUrl = globals.apiSearchBase + "?page-size=50&format=json&show-fields=all&show-tags=all&api-key=" + Config.apiKey;
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
