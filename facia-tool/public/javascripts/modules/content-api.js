/* global _: true */
define([
    'modules/authed-ajax',
    'modules/vars',
    'modules/cache'
],
function (
    authedAjax,
    vars,
    cache
){
    function validateItem (item) {
        var result = cache.get('contentApi', item.id),
            defer = $.Deferred();

        if(result) {
            populate(result, item);
            defer.resolve(result);
        } else {
            fetchData([item.id])
            .done(function(result){
                result = result.length === 1 ? result[0] : undefined;

                if (result) {
                    cache.put('contentApi', result.id, result);
                    populate(result, item);
                    defer.resolve(result);
                } else {
                    defer.reject();
                }
            }).fail(function(){
                defer.reject();
            });
        }
        return defer.promise();
    }

    function decorateItems (items) {
        var ids = [];

        items.forEach(function(item){
            var result = cache.get('contentApi', item.id);
            if(result) {
                populate(result, item);
            } else {
                ids.push(item.id);
            }
        });

        fetchData(ids)
        .done(function(results){
            results.forEach(function(article){
                cache.put('contentApi', article.id, article);
                _.filter(items, function(item){
                    return item.id === article.id;
                }).forEach(function(item){
                    populate(article, item);
                });
            });

            _.each(items, function(item){
                item.state.isEmpty(!item.state.isLoaded());
            });
        });
    }

    function populate(opts, article) {
        article.populate(opts, true);
    }

    function fetchData(ids) {
        var apiUrl,
            defer = $.Deferred();

        if (ids.length) {
            apiUrl = vars.CONST.apiSearchBase + "/search?page-size=50&format=json&show-fields=all";
            apiUrl += "&ids=" + ids.map(function(id){
                return encodeURIComponent(id);
            }).join(',');

            authedAjax.request({
                url: apiUrl
            }).always(function(resp) {
                if (resp.response && _.isArray(resp.response.results)) {
                    defer.resolve(resp.response.results);
                } else {
                    defer.reject();
                }
            });
        }
        return defer;
    }

    return {
        decorateItems: decorateItems,
        validateItem:  validateItem
    };

});
