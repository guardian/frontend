define([
    'modules/authedAjax',
    'models/common',
    'modules/cache'
],
function (
    authedAjax,
    common,
    cache
){
    function validateItem (item) {
        var data = cache.get('contentApi', item.props.id()),
            defer = $.Deferred();

        if(data) {
            populate(data, item);
            defer.resolve();
        } else {
            fetchData([item.props.id()])
            .done(function(result){
                if(result.length !== 1) {
                    defer.reject();
                }
                result = result[0];
                cache.put('contentApi', result.id, result);
                populate(result, item);
                defer.resolve();
            }).fail(function(){
                defer.reject();
            });
        }
        return defer;
    };

    function decorateItems (items) {
        var ids = [];

        items.forEach(function(item){
            var data = cache.get('contentApi', item.props.id());
            if(data) {
                populate(data, item);
            } else {
                ids.push(item.props.id());
            }
        });

        fetchData(ids)
        .done(function(results){
            results.forEach(function(article){
                cache.put('contentApi', article.id, article);
                _.filter(items,function(item){
                    return item.props.id() === article.id;
                }).forEach(function(item){
                    populate(article, item);
                });
            });
        });
    };

    function populate(fromObj, toKoObj) {
        toKoObj.populate(fromObj);
    }

    function fetchData(ids) {
        var apiUrl,
            defer = $.Deferred();

        if (ids.length) {
            apiUrl = common.config.apiSearchBase + "/search?page-size=50&format=json&show-fields=all&show-tags=all";
            apiUrl += "&ids=" + ids.map(function(id){
                return encodeURIComponent(id);
            }).join(',');

            authedAjax.request({
                url: apiUrl
            }).always(function(resp) {
                if (resp.response && resp.response.results && resp.response.results.length) {
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
    }

});
