/* global _: true */
define([
    'modules/vars',
    'modules/authed-ajax',
    'modules/cache',
    'utils/internal-content-code',
    'utils/url-host',
    'utils/url-abs-path',
    'utils/snap'
],
function (
    vars,
    authedAjax,
    cache,
    internalContentCode,
    urlHost,
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
            defer.resolve(item);

        } else if (item.meta.snapType()) {
            item.convertToSnap();
            defer.resolve(item);

        } else if (data) {
            item.id(capiId);
            populate(item, data);
            defer.resolve(item);

        } else {
            fetchContentById(capiId)
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

                // A snap, but a link off of the tool itself
                } else if (_.some([window.location.hostname, vars.CONST.viewer], function(str) { return item.id().indexOf(str) > -1; })) {
                    err = 'Sorry, that link cannot be added to a front';

                // A snap, but not an absolute url
                } else if (!item.id().match(/^https?:\/\//) && results.length === 0) {
                    err = 'Sorry, that\'s not a valid URL';

                // A snap, but a link to unavailable guardian content
                } else if (urlHost(item.id()) === 'www.theguardian.com' && results.length === 0) {
                    err = 'Sorry, that Guardian content is unavailable';

                // A snap, but snaps can only be created to the Clipboard
                } else if (item.group.parentType !== 'Clipboard' && results.length === 0) {
                    err = 'Sorry, snaps can only be created on the Clipboard';

                // A snap that's legitimate (includes case where results.length > 1, eg. is the target is a Guardian tag page)
                } else {
                    item.convertToSnap();
                }

                if (err) {
                    defer.reject(err);
                } else {
                    defer.resolve(item);
                }
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
            .filter(function(article) { return !article.state.isSnap(); })
            .each(function(article) {
                article.state.isEmpty(!article.state.isLoaded());
            });
        });
    }

    function populate(article, contentApiArticle) {
        article.populate(contentApiArticle, true);
    }

    function fetchContentByIds(ids) {
        var capiIds = _.chain(ids)
            .filter(function(id) { return !snap.validateId(id); })
            .map(function(id) { return encodeURIComponent(id); })
            .value();

        if (capiIds.length) {
            return fetchContent('search?ids=' + capiIds.join(',') + '&' + vars.CONST.apiSearchParams);
        } else {
            return $.Deferred().resolve([]);
        }
    }

    function fetchContentById(id) {
        return fetchContent(id + '?' + vars.CONST.apiSearchParams);
    }

    function fetchContent(apiUrl) {
        var defer = $.Deferred();

        authedAjax.request({
            url: vars.CONST.apiSearchBase + '/' + apiUrl
        }).always(function(resp) {
            if (!resp.response) {
                defer.resolve([]);
            } else if (resp.response.content) {
                defer.resolve([resp.response.content]);
            } else {
                defer.resolve(_.chain(['editorsPicks', 'results', 'mostViewed'])
                    .filter(function(key) { return _.isArray(resp.response[key]); })
                    .map(function(key) { return resp.response[key]; })
                    .flatten()
                    .value());
            }
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
