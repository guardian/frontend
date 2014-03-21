/* global _: true */
define([
    'modules/authed-ajax',
    'modules/vars',
    'modules/cache',
    'utils/internal-content-code'
],
function (
    authedAjax,
    vars,
    cache,
    icc
){
    var apiPageSize = vars.CONST.apiPageSize || 50;

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
                    cache.put('contentApi', icc(result), result);
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
        if (items.length) {
            decorateItemsBatch(_.first(items, apiPageSize));
            decorateItems(_.rest(items, apiPageSize));
        }
    }

    function decorateItemsBatch (items) {
        var ids = [];

        items.forEach(function(item){
            var result = cache.get('contentApi', item.id);
            if(result) {
                populate(result, item);
            } else {
                ids.push(item.id);
            }
        });

        if (!ids.length) { return; }

        fetchData(ids)
        .done(function(results){
            results.forEach(function(article) {
                var id = icc(article);

                if (!id) { return; }

                cache.put('contentApi', id, article);
                _.filter(items, function(item){
                    return item.id === id || item.id === article.id; // TODO: remove 2nd clause after full transition to internal-code/content/... IDs
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
        article.populate(opts);
    }

    function fetchData(ids) {
        var apiUrl,
            defer = $.Deferred();

        if (ids.length) {
            apiUrl = vars.CONST.apiSearchBase + '/search?format=json&show-fields=all&page-size=' + apiPageSize;
            apiUrl += '&ids=' + ids.map(function(id){
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
