/* global _: true */
define([
    'modules/authed-ajax',
    'modules/vars',
    'modules/cache',
    'utils/url-abs-path',
    'utils/snap'
],
function (
    authedAjax,
    vars,
    cache,
    urlAbsPath,
    snap
){
    function validateItem (item) {
        var defer = $.Deferred(),
            snapId = snap.validateId(item.id()),
            capiId = urlAbsPath(item.id()),
            data;

        if (snapId) {
            item.id(snapId);
            defer.resolve();
        } else {
            data = cache.get('contentApi', capiId);
            if (data) {
                item.id(capiId);
                populate(data, item);
                defer.resolve();
            } else {
                fetchContentByIds([capiId])
                .done(function(result) {
                    if (result.length === 1) {
                        // It's a ContentApi item
                        item.id(capiId);
                        cache.put('contentApi', capiId, result[0]);
                        populate(result[0], item);
                        defer.resolve();

                    } else {
                        // It's a snap
                        if (!vars.model.switches()['facia-tool-snaps']) {
                            defer.resolve(true, 'Sorry, that link wasn\'t recognised. It cannot be added to a front.');

                        // A snap cannot be added in live mode if it has no headline
                        } else if (vars.model.liveMode() &&
                            item.parentType !== 'Clipboard' &&
                            !item.fields.headline() &&
                            !item.meta.headline()) {
                            defer.resolve(true, 'Sorry, snaps without headlines can\'t be added in live mode.');

                        } else {
                            item.convertToSnap();
                            defer.resolve();
                        }
                    }
                });
            }
        }
        return defer.promise();
    }

    function decorateItems (articles) {
        var num = vars.CONST.capiBatchSize || 10;

        _.each(_.range(0, articles.length, num), function(index) {
            decorateBatch(articles.slice(index, index + num));
        });
    }

    function decorateBatch (articles) {
        var ids = [];

        articles.forEach(function(article){
            var data = cache.get('contentApi', article.id());
            if(data) {
                populate(data, article);
            } else {
                ids.push(article.id());
            }
        });

        fetchContentByIds(ids)
        .done(function(results){
            results.forEach(function(result) {
                cache.put('contentApi', result.id, result);
                _.filter(articles, function(article){
                    return article.id() === result.id;
                }).forEach(function(article){
                    populate(result, article);
                });
            });

           _.chain(articles)
            .filter(function(article) { return !article.isSnap(); })
            .each(function(article) {
                article.state.isEmpty(!article.state.isLoaded());
            });
        });
    }

    function populate(opts, article) {
        article.populate(opts, true);
    }

    function fetchContentByIds(ids) {
        var capiIds = _.chain(ids)
            .filter(function(id) { return !snap.validateId(id); })
            .map(function(id) { return encodeURIComponent(id); })
            .value();

        if (capiIds.length) {
            return fetchContent('search?ids=' + capiIds.join(',') + '&page-size=50&format=json&show-fields=all');
        } else {
            return $.Deferred().resolve([]);
        }
    }

    function fetchContent(apiUrl) {
        var defer = $.Deferred();

        authedAjax.request({
            url: vars.CONST.apiSearchBase + '/' + apiUrl
        }).always(function(resp) {
            defer.resolve(resp.response ?
               _.chain(['editorsPicks', 'results'])
                .filter(function(key) { return _.isArray(resp.response[key]); })
                .map(function(key) { return resp.response[key]; })
                .flatten()
                .value() : []);
        });

        return defer.promise();
    }

    return {
        fetchContent: fetchContent,
        decorateItems: decorateItems,
        validateItem:  validateItem
    };

});
