/* global _: true */
define([
    'modules/authed-ajax',
    'modules/vars',
    'modules/cache',
    'utils/url-abs-path'
],
function (
    authedAjax,
    vars,
    cache,
    urlAbsPath
){
    function validateItem (item) {
        var defer = $.Deferred(),
            capiId,
            data;

        if (isSnapId(item.id)) {
            defer.resolve();
        } else {
            capiId = urlAbsPath(item.id);
            data = cache.get('contentApi', capiId);

            if (data) {
                item.id = capiId;
                populate(data, item);
                defer.resolve();
            } else {
                fetchData([capiId])
                .always(function(result) {
                    if (_.isArray(result) && result.length === 1) {
                        item.id = capiId;
                        cache.put('contentApi', capiId, result[0]);
                        populate(result[0], item);
                    } else {
                        // TODO remove recognised meta queryparams from id
                        item.meta.href(item.id);
                        item.id = 'snap/' + new Date().getTime();
                    }
                    defer.resolve();
                });
            }
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

        fetchData(ids)
        .done(function(results){
            results.forEach(function(result) {
                cache.put('contentApi', result.id, result);
                _.filter(articles, function(article){
                    return article.id === result.id;
                }).forEach(function(article){
                    populate(result, article);
                });
            });

           _.chain(articles)
            .filter(function(article) { return !isSnapId(article.id); })
            .each(function(article) {
                article.state.isEmpty(!article.state.isLoaded());
            });
        });
    }

    function isSnapId(id) {
        return id.match(/^snap\//);
    }

    function populate(opts, article) {
        article.populate(opts, true);
    }

    function fetchData(ids) {
        var defer = $.Deferred(),
            capiIds = _.chain(ids)
                .filter(function(id) { return !isSnapId(id); })
                .map(function(id) { return encodeURIComponent(id); })
                .value();

        if (capiIds.length) {
            authedAjax.request({
                url: vars.CONST.apiSearchBase + '/search?ids=' + capiIds.join(',') + '&page-size=50&format=json&show-fields=all'
            }).done(function(resp) {
                if (resp.response && _.isArray(resp.response.results)) {
                    defer.resolve(resp.response.results);
                } else {
                    defer.resolve([]);
                }
            }).fail(function() {
                defer.resolve([]);
            });
        }
        return defer;
    }

    return {
        decorateItems: decorateItems,
        validateItem:  validateItem
    };

});
