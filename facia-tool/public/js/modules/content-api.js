define([
    'underscore',
    'jquery',
    'modules/vars',
    'modules/authed-ajax',
    'modules/cache',
    'modules/modal-dialog',
    'utils/internal-content-code',
    'utils/url-abs-path',
    'utils/identity',
    'utils/is-guardian-url',
    'utils/snap'
],
function (
    _,
    $,
    vars,
    authedAjax,
    cache,
    modalDialog,
    internalContentCode,
    urlAbsPath,
    identity,
    isGuardianUrl,
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

        } else if (data) {
            item.id(capiId);
            populate(item, data);
            defer.resolve(item);

        } else {
            // Tag combiners need conversion from tag1+tag2 to search?tag=tag1,tag2
            if (capiId.match(/\+/) && isGuardianUrl(item.id())) {
                capiId = 'search?tag=' + capiId.split(/\+/).join(',') + '&';
            } else {
                capiId += '?';
            }

            capiId += vars.CONST.apiSearchParams;

            fetchContent(capiId)
            .done(function(results, resultsTitle) {
                var capiItem,
                    icc,
                    err;

                // ContentApi item
                if (results && results.length === 1) {
                    capiItem = results[0];
                    icc = internalContentCode(capiItem);
                    if (icc) {
                        populate(item, capiItem);
                        cache.put('contentApi', icc, capiItem);
                        item.id(icc);
                    } else {
                        err = 'Sorry, that article is malformed (has no internalContentCode)';
                    }

                // A snap, but not an absolute url
                } else if (!item.id().match(/^https?:\/\//)) {
                    err = 'Sorry, URLs must begin with http...';

                // A snap, but snaps can only be created to the Clipboard
                } else if (item.group.parentType !== 'Clipboard') {
                    err = 'Sorry, special links must be dragged to the Clipboard, initially';

                // A snap, but a link off of the tool itself
                } else if (item.id().indexOf(window.location.hostname) > -1) {
                    err = 'Sorry, that link cannot be added to a front';

                // A snap, but a link to unavailable guardian content
                } else if (results && results.length === 0 && isGuardianUrl(item.id())) {
                    err = 'Sorry, that Guardian content is unavailable';

                // A snap, that's setting it's own type, ie via dragged-in query params
                } else if (item.meta.snapType()) {
                    item.convertToSnap();

                // A snap, of type 'latest', ie.  where the target is a Guardian tag/section page.
                } else if (results && results.length > 1) {
                    modalDialog.confirm({
                        name: 'select_snap_type',
                        data: {
                            prefix: vars.CONST.latestSnapPrefix,
                            resultsTitle: resultsTitle
                        }
                    }).then(function () {
                        item.convertToLatestSnap(resultsTitle);
                        defer.resolve(item);
                    }, function () {
                        item.convertToLinkSnap();
                        defer.resolve(item);
                    });

                    // Waiting for the modal to be closed
                    return;

                    // A snap, of default type 'link'.
                } else {
                    item.convertToLinkSnap();
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
            if (!_.isArray(results)) {
                return;
            }

            results.forEach(function(result) {
                var icc = internalContentCode(result);

                if(icc) {
                    cache.put('contentApi', icc, result);

                    _.filter(articles, function(article) {
                        return article.id() === icc;
                    }).forEach(function(article) {
                        populate(article, result);
                    });
                }
            });

           _.chain(articles)
            // legacy-snaps
            .filter(function(article) { return !article.meta.href(); })

            .filter(function(article) { return !article.meta.snapType(); })
            .each(function(article) {
                article.state.isEmpty(!article.state.isLoaded());
            });
        });
    }

    function populate(article, capiData) {
        article.addCapiData(capiData);
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

    function fetchContent(apiUrl) {
        var defer = $.Deferred();

        authedAjax.request({
            url: vars.CONST.apiSearchBase + '/' + apiUrl
        }).always(function(resp) {
            if (!resp.response
                || _.intersection(['content', 'editorsPicks', 'results', 'mostViewed'], _.keys(resp.response)).length === 0
                || resp.response.status === 'error') {
                defer.resolve();
            } else if (resp.response.content) {
                defer.resolve([resp.response.content], getTagOrSectionTitle(resp.response));
            } else {
                defer.resolve(
                   _.chain(['editorsPicks', 'results', 'mostViewed'])
                    .filter(function(key) { return _.isArray(resp.response[key]); })
                    .map(function(key) { return resp.response[key]; })
                    .flatten()
                    .value(),
                    getTagOrSectionTitle(resp.response)
                );
            }
        });

        return defer.promise();
    }

    function getTagOrSectionTitle(response) {
        return _.chain([response.tag, response.section])
            .filter(identity)
            .pluck('webTitle')
            .first()
            .value();
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

    function dateYyyymmdd() {
        var d = new Date();
        return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(function(p) { return p < 10 ? '0' + p : p; }).join('-');
    }

    function fetchLatest (options) {
        var url = vars.CONST.apiSearchBase + '/',
            propName, term;

        options = _.extend({
            article: '',
            term: '',
            filter: '',
            filterType: '',
            page: 1,
            pageSize: vars.CONST.searchPageSize || 25,
            isDraft: true
        }, options);
        term = options.term;

        if (options.article) {
            term = options.article;
            propName = 'content';
            url += term + '?' + vars.CONST.apiSearchParams;
        } else {
            term = encodeURIComponent(term.trim().replace(/ +/g,' AND '));
            propName = 'results';
            url += 'search?' + vars.CONST.apiSearchParams;
            url += options.isDraft ?
                '&content-set=-web-live&order-by=oldest&use-date=scheduled-publication&from-date=' + dateYyyymmdd() :
                '&content-set=web-live&order-by=newest';
            url += '&page-size=' + options.pageSize;
            url += '&page=' + options.page;
            url += term ? '&q=' + term : '';
            url += options.filter ? '&' + options.filterType + '=' + encodeURIComponent(options.filter) : '';
        }

        var deferred = new $.Deferred();
        authedAjax.request({
            url: url
        }).then(function(data) {
            var rawArticles = data.response && data.response[propName] ? [].concat(data.response[propName]) : [];

            if (!term && !rawArticles.length) {
                deferred.reject(new Error('Sorry, the Content API is not currently returning content'));
            } else {
                deferred.resolve(_.extend({}, data.response, {
                    results: _.filter(rawArticles, function(opts) {
                        return opts.fields && opts.fields.headline;
                    })
                }));
            }
        }, function (xhr) {
            deferred.reject(new Error('Content API error (' + xhr.status + '). Content is currently unavailable'));
        });

        return deferred.promise();
    }

    return {
        fetchContent: fetchContent,
        fetchMetaForPath: fetchMetaForPath,
        decorateItems: decorateItems,
        validateItem:  validateItem,
        fetchLatest: fetchLatest
    };

});
