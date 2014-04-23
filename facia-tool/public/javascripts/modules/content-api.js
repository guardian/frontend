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
        var data = cache.get('contentApi', item.id),
            defer = $.Deferred();

        if(data) {
            populate(data, item);
            defer.resolve();
        } else {
            fetchContentByIds([item.id])
            .done(function(result){
                if (result.length === 1) {
                    result = result[0];
                    cache.put('contentApi', result.id, result);
                    populate(result, item);
                    defer.resolve();
                } else {
                    defer.reject();
                }
            }).fail(function(){
                defer.reject();
            });
        }
        return defer.promise();
    }

    function decorateItems (articles) {
        var ids = [];

        articles.forEach(function(article){
            var data = cache.get('contentApi', article.id);
            if(data) {
                populate(data, article);
            } else {
                ids.push(article.id);
            }
        });

        fetchContentByIds(ids)
        .done(function(results){
            results.forEach(function(result) {
                cache.put('contentApi', result.id, result);
                _.filter(articles, function(article){
                    return article.id === result.id;
                }).forEach(function(article){
                    populate(result, article);
                });
            });

            _.each(articles, function(article){
                article.state.isEmpty(!article.state.isLoaded());
            });
        });
    }

    function populate(opts, article) {
        article.populate(opts, true);
    }

    function fetchContentByIds(ids) {
        var apiUrl;

        if (ids.length) {
            apiUrl = 'search?page-size=50&format=json&show-fields=all';
            apiUrl += '&ids=' + ids.map(function(id){
                return encodeURIComponent(id);
            }).join(',');
            return fetchContent(apiUrl);

        } else {
            return $.Deferred().reject();
        }
    }

    function fetchContent(apiUrl) {
        var defer = $.Deferred();

        authedAjax.request({
            url: vars.CONST.apiSearchBase + '/' + apiUrl
        }).always(function(resp) {
            var items = resp.response ?
                        _.chain(['results', 'editorsPicks', 'mostViewed'])
                         .filter(function(key) { return _.isArray(resp.response[key]); })
                         .map(function(key) { return resp.response[key]; })
                         .flatten()
                         .value() : [];

            if (items.length > 0) {
                defer.resolve(items);
            } else {
                defer.reject();
            }
        });

        return defer;
    }

    return {
        fetchContent: fetchContent,
        decorateItems: decorateItems,
        validateItem:  validateItem
    };

});
