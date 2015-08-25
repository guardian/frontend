import _ from 'underscore';
import Promise from 'Promise';
import {CONST} from 'modules/vars';
import {request} from 'modules/authed-ajax';
import * as cache from 'modules/cache';
import modalDialog from 'modules/modal-dialog';
import internalPageCode from 'utils/internal-page-code';
import internalContentCode from 'utils/internal-content-code';
import urlAbsPath from 'utils/url-abs-path';
import identity from 'utils/identity';
import isGuardianUrl from 'utils/is-guardian-url';
import * as snap from 'utils/snap';
import reportErrors from 'utils/report-errors';

function populate(article, capiData) {
    article.addCapiData(capiData);
}

function getTagOrSectionTitle(response) {
    return _.chain([response.tag, response.section])
        .pluck('webTitle')
        .filter(identity)
        .first()
        .value();
}

function fetchContent(apiUrl) {
    return request({
        url: CONST.apiSearchBase + '/' + apiUrl
    }).then(function(resp) {
        if (!resp.response
            || _.intersection(['content', 'editorsPicks', 'results', 'mostViewed'], _.keys(resp.response)).length === 0
            || resp.response.status === 'error') {
            return;
        } else if (resp.response.content) {
            return {
                content: [resp.response.content],
                title: getTagOrSectionTitle(resp.response)
            };
        } else {
            return {
                content: _.chain(['editorsPicks', 'results', 'mostViewed'])
                    .filter(function(key) { return _.isArray(resp.response[key]); })
                    .map(function(key) { return resp.response[key]; })
                    .flatten()
                    .value(),
                title: getTagOrSectionTitle(resp.response)
            };
        }
    })
    // swallow error
    .catch(function () {});
}

function validateItem (item) {
    return new Promise(function (resolve, reject) {
        var snapId = snap.validateId(item.id()),
            capiId = urlAbsPath(item.id()),
            data = cache.get('contentApi', capiId);

        if (snapId) {
            item.id(snapId);
            resolve(item);

        } else if (data) {
            item.id(capiId);
            populate(item, data);
            resolve(item);

        } else {
            // Tag combiners need conversion from tag1+tag2 to search?tag=tag1,tag2
            if (capiId.match(/\+/) && isGuardianUrl(item.id())) {
                capiId = 'search?tag=' + capiId.split(/\+/).join(',') + '&';
            } else {
                capiId += '?';
            }

            capiId += CONST.apiSearchParams;

            fetchContent(capiId)
            .then(function(res) {
                // TODO Phantom Babel bug
                if (!res) { res = {}; }
                var results = res.content,
                    resultsTitle = res.title,
                    capiItem,
                    icc,
                    pageCode,
                    err;

                // ContentApi item
                if (results && results.length === 1) {
                    capiItem = results[0];
                    icc = internalContentCode(capiItem);
                    pageCode = internalPageCode(capiItem);
                    if (icc && icc === item.id()) {
                        populate(item, capiItem);
                        cache.put('contentApi', icc, capiItem);
                        item.id(icc);
                    } else if (pageCode) {
                        populate(item, capiItem);
                        cache.put('contentApi', pageCode, capiItem);
                        // Populate the cache with icc as well
                        if (icc) {
                            cache.put('contentApi', icc, capiItem);
                        }
                        item.id(pageCode);
                    } else {
                        err = 'Sorry, that article is malformed (has no internalPageCode)';
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
                            prefix: CONST.latestSnapPrefix,
                            resultsTitle: resultsTitle
                        }
                    }).then(function () {
                        item.convertToLatestSnap(resultsTitle);
                        resolve(item);
                    }, function () {
                        item.convertToLinkSnap();
                        resolve(item);
                    });

                    // Waiting for the modal to be closed
                    return;

                    // A snap, of default type 'link'.
                } else {
                    item.convertToLinkSnap();
                }

                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(item);
                }
            });
        }
    });
}

function fetchContentByIds(ids) {
    var capiIds = _.chain(ids)
        .filter(function(id) { return !snap.validateId(id); })
        .map(function(id) { return encodeURIComponent(id); })
        .value();

    if (capiIds.length) {
        return fetchContent('search?ids=' + capiIds.join(',') + '&' + CONST.apiSearchParams);
    } else {
        return Promise.resolve();
    }
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

    return fetchContentByIds(ids)
    .then(function(res) {
        // TODO Phantom Babel bug
        if (!res) { res = {}; }
        var results = res.content;
        if (!_.isArray(results)) {
            return;
        }

        results.forEach(function(result) {
            var pageCode = internalPageCode(result),
                icc = internalContentCode(result);

            if (pageCode) {
                cache.put('contentApi', pageCode, result);
                if (icc) {
                    cache.put('contentApi', icc, result);
                }

                _.filter(articles, function(article) {
                    var id = article.id();
                    return id === pageCode || id === icc;
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
    })
    .catch(reportErrors);
}

function decorateItems (articles) {
    var num = CONST.capiBatchSize || 10,
        pending = [];

    _.each(_.range(0, articles.length, num), function(index) {
        pending.push(decorateBatch(articles.slice(index, index + num)));
    });

    return Promise.all(pending);
}

function fetchMetaForPath(path) {
    return request({
        url: CONST.apiSearchBase + '/' + path + '?page-size=0'
    }).then(function(resp) {
        return !resp.response ? {} :
           _.chain(['tag', 'section'])
            .map(function(key) { return resp.response[key]; })
            .filter(function(obj) { return _.isObject(obj); })
            .reduce(function(m, obj) {
                m.section = m.section || _.last((obj.id || obj.sectionId || '').split('/'));
                m.webTitle = m.webTitle || obj.webTitle;
                m.description = m.description || obj.description; // upcoming in Capi, at time of writing
                m.title = m.title || obj.title;                   // this may never be added to Capi, or may under another name
                return m;
             }, {})
            .value();
    })
    // swallow error
    .catch(function () {});
}

function dateYyyymmdd() {
    var d = new Date();
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(function(p) { return p < 10 ? '0' + p : p; }).join('-');
}

function fetchLatest (options) {
    var url = CONST.apiSearchBase + '/',
        propName, term, filter;

    options = _.extend({
        article: '',
        term: '',
        filter: '',
        filterType: '',
        page: 1,
        pageSize: CONST.searchPageSize || 25,
        isDraft: true
    }, options);
    term = options.term;
    filter = options.filter;

    if (options.article) {
        term = options.article;
        propName = 'content';
        url += term + '?' + CONST.apiSearchParams;
    } else {
        term = encodeURIComponent(term.trim());
        propName = 'results';
        url += 'search?' + CONST.apiSearchParams;
        url += options.isDraft ?
            '&content-set=-web-live&order-by=oldest&use-date=scheduled-publication&from-date=' + dateYyyymmdd() :
            '&content-set=web-live&order-by=newest';
        url += '&page-size=' + options.pageSize;
        url += '&page=' + options.page;
        url += term ? '&q=' + term : '';
        url += filter ? '&' + options.filterType + '=' + encodeURIComponent(filter) : '';
    }

    return request({
        url: url
    }).then(function (data) {
        var rawArticles = data.response && data.response[propName] ? [].concat(data.response[propName]) : [];

        if (!term && !filter && !rawArticles.length) {
            throw new Error('Sorry, the Content API is not currently returning content');
        } else {
            return _.extend({}, data.response, {
                results: _.filter(rawArticles, function(opts) {
                    return opts.fields && opts.fields.headline;
                })
            });
        }
    }, function (xhr) {
        throw new Error('Content API error (' + xhr.status + '). Content is currently unavailable');
    });
}

export {
    fetchContent,
    fetchMetaForPath,
    decorateItems,
    validateItem,
    fetchLatest
};
