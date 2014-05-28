/* global _: true */
define([
    'modules/authed-ajax',
    'modules/vars',
    'modules/cache',
    'utils/internal-content-code',
    'utils/url-abs-path',
    'utils/snap'
],
function (
    authedAjax,
    vars,
    cache,
    internalContentCode,
    urlAbsPath,
    snap
){
    function validateItem (item) {
        var defer = $.Deferred(),
            snapId = snap.validateId(item.id()),
            capiId = urlAbsPath(item.id()),
            data = cache.get('contentApi', capiId);

        if (snapId) {
            item.id(snapId);
            defer.resolve();

        } else if (item.meta.snapType()) {
            item.convertToSnap();
            defer.resolve();

        } else if (data) {
            item.id(capiId);
            populate(item, data);
            defer.resolve();

        } else {
            fetchContentByIds([capiId])
            .done(function(results) {
                var capiItem,
                    icc,
                    err;

                // ContentApi item
                if (results.length === 1) {
                    capiItem = results[0];
                    icc = internalContentCode(capiItem);
                    if (icc) {
                        populate(item, capiItem);
                        cache.put('contentApi', icc, capiItem);
                        item.id(icc);
                    } else {
                        err = 'Sorry, that article is malformed (has no internalContentCode)';
                    }

                // Snap, but they're disabled
                } else if (!vars.model.switches()['facia-tool-snaps']) {
                    err = 'Sorry, that link wasn\'t recognised. It cannot be added to a front';

                // Snap, but cannot be added in live mode if it has no headline
                } else if (vars.model.liveMode() &&
                    item.parentType !== 'Clipboard' &&
                    !item.fields.headline() &&
                    !item.meta.headline()) {
                    err = 'Sorry, snaps without headlines can\'t be added in live mode';

                // Snap!
                } else {
                    item.convertToSnap();
                }

                defer[err ? 'reject' : 'resolve'](err);
            });
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
                populate(article, data);
            } else {
                ids.push(article.id());
            }
        });

        fetchContentByIds(ids)
        .done(function(results){
            results.forEach(function(result) {
                var icc = internalContentCode(result);

                if(icc) {
                    cache.put('contentApi', icc, result);

                    _.filter(articles, function(article) {
                        return article.id() === icc || article.id() === result.id; // TODO: remove 2nd clause after full transition to internal-code/content/ ids
                    }).forEach(function(article) {
                        populate(article, result);
                    });
                }
            });

           _.chain(articles)
            .filter(function(article) { return !article.isSnap(); })
            .each(function(article) {
                article.state.isEmpty(!article.state.isLoaded());
            });
        });
    }

    function populate(article, opts) {
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
               _.chain(['editorsPicks', 'results', 'mostViewed'])
                .filter(function(key) { return _.isArray(resp.response[key]); })
                .map(function(key) { return resp.response[key]; })
                .flatten()
                .value() : []);
        });

        return defer.promise();
    }

    function fetchMetaForPath(path) {
        var defer = $.Deferred();

        authedAjax.request({
            url: vars.CONST.apiSearchBase + '/' + path + '?page-size=0'
        }).always(function(resp) {
            defer.resolve(!resp.response ? {} :
               _.chain(['tag', 'section'])
                .map(function(key) { return resp.response[key]; })
                .filter(function(obj) { return _.isObject(obj); })
                .reduce(function(m, obj) {
                    m.section = m.section || _.last((obj.id || obj.sectionId).split('/'));
                    m.webTitle = m.webTitle || obj.webTitle;
                    m.description = m.description || obj.description; // upcoming in Capi, at time of writing
                    m.title = m.title || obj.title;                   // this may never be added to Capi, or may under another name
                    return m;
                 }, {})
                .value());
        });

        return defer.promise();
    }

    return {
        fetchContent: fetchContent,
        fetchMetaForPath: fetchMetaForPath,
        decorateItems: decorateItems,
        validateItem:  validateItem
    };

});
