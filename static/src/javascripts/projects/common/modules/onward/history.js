/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'common/utils/storage',
    'common/utils/url',
    'common/modules/experiments/ab',
    'text!common/views/history/tag.html',
    'text!common/views/history/mega-nav.html',
    'lodash/objects/isObject',
    'lodash/objects/isNumber',
    'lodash/collections/find',
    'lodash/collections/forEach',
    'lodash/collections/some',
    'lodash/objects/keys',
    'lodash/objects/assign',
    'lodash/collections/reduce',
    'lodash/objects/isArray',
    'lodash/collections/map',
    'common/utils/chain',
    'lodash/arrays/compact',
    'lodash/collections/pluck',
    'lodash/arrays/last',
    'lodash/collections/sortBy',
    'lodash/collections/reduceRight'
], function (
    fastdom,
    $,
    config,
    template,
    storage,
    url,
    ab,
    viewTag,
    viewMegaNav,
    isObject,
    isNumber,
    find,
    forEach,
    some,
    keys,
    assign,
    reduce,
    isArray,
    map,
    chain,
    compact,
    pluck,
    last,
    sortBy,
    reduceRight) {
    var editions = [
            'uk',
            'us',
            'au'
        ],
        editionalised = [
            'business',
            'commentisfree',
            'culture',
            'environment',
            'media',
            'money',
            'sport',
            'technology'
        ],
        pageMeta = [
            {tid: 'section',    tname: 'sectionName'},
            {tid: 'keywordIds', tname: 'keywords'},
            {tid: 'seriesId',   tname: 'series'},
            {tid: 'authorIds',  tname: 'author'}
        ],
        buckets = [
            {
                type: 'content',
                indexInRecord: 1
            },
            {
                type: 'front',
                indexInRecord: 2
            }
        ],
        summaryPeriodDays = 30,
        forgetUniquesAfter = 10,
        historySize = 50,

        storageKeyHistory = 'gu.history',
        storageKeySummary = 'gu.history.summary',

        today =  Math.floor(Date.now() / 86400000), // 1 day in ms
        historyCache,
        summaryCache,
        popularFilteredCache,
        topNavItemsCache,

        inMegaNav = false,

        isEditionalisedRx = new RegExp('^(' + editions.join('|') + ')\/(' + editionalised.join('|') + ')$'),
        stripEditionRx = new RegExp('^(' + editions.join('|') + ')\/');

    function saveHistory(history) {
        historyCache = history;
        return storage.local.set(storageKeyHistory, history);
    }

    function saveSummary(summary) {
        summaryCache = summary;
        return storage.local.set(storageKeySummary, summary);
    }

    function getHistory() {
        historyCache = historyCache || storage.local.get(storageKeyHistory) || [];
        return historyCache;
    }

    function getSummary() {
        if (!summaryCache) {
            summaryCache = storage.local.get(storageKeySummary);

            if (!isObject(summaryCache) || !isObject(summaryCache.tags) || !isNumber(summaryCache.periodEnd)) {
                summaryCache = {
                    periodEnd: today,
                    tags: {},
                    showInMegaNav: true
                };
            }
        }
        return summaryCache;
    }

    function deleteFromSummary(tag) {
        var summary = getSummary();

        delete summary.tags[tag];
        saveSummary(summary);
    }

    function isRevisit(pageId) {
        return (find(getHistory(), function (page) {
            return (page[0] === pageId);
        }) || [])[1] > 1;
    }

    function pruneSummary(summary, mockToday) {
        var newToday = mockToday || today,
            updateBy = newToday - summary.periodEnd;

        if (updateBy !== 0) {
            summary.periodEnd = newToday;

            forEach(summary.tags, function (record, tid) {
                var result = chain(buckets).and(map, function (bucket) {
                        var visits = chain(record[bucket.indexInRecord]).and(map, function (day) {
                                var newAge = day[0] + updateBy;
                                return newAge < summaryPeriodDays && newAge >= 0 ? [newAge, day[1]] : false;
                            }).and(compact).value();

                        return (visits.length > 1 || (visits.length === 1 && visits[0][0] < forgetUniquesAfter)) ? visits : [];
                    }).value();

                if (some(result, function (r) { return r.length; })) {
                    summary.tags[tid] = [record[0]].concat(result);
                } else {
                    delete summary.tags[tid];
                }
            });
        }

        return summary;
    }

    function getPopular(opts) {
        var tags = getSummary().tags,
            tids = keys(tags),
            op = assign({
                number: 100,
                weights: {},
                thresholds: {}
            }, opts);

        tids = op.whitelist ? tids.filter(function (tid) { return op.whitelist.indexOf(tid) > -1; }) : tids;
        tids = op.blacklist ? tids.filter(function (tid) { return op.blacklist.indexOf(tid) === -1; }) : tids;

        return chain(tids).and(map, function (tid) {
                var record = tags[tid],
                    rank = reduce(buckets, function (rank, bucket) {
                        return rank + tally(record[bucket.indexInRecord], op.weights[bucket.type], op.thresholds[bucket.type]);
                    }, 0);

                return {
                    idAndName: [tid, record[0]],
                    rank: rank
                };
            })
            .and(compact)
            .and(sortBy, 'rank')
            .and(last, op.number)
            .reverse()
            .and(pluck, 'idAndName')
            .value();
    }

    function getPopularFiltered(opts) {
        var flush = opts && opts.flush;

        popularFilteredCache = (!flush && popularFilteredCache) || getPopular({
            blacklist: getTopNavItems(),
            number: 10,
            weights: {
                'content': 1,
                'front': 5
            },
            thresholds: {
                'content': 5,
                'front': 1
            }
        });

        return popularFilteredCache;
    }

    function tally(visits, weight, minimum) {
        var totalVisits = 0,
            result;

        weight = weight || 1;
        minimum = minimum || 1;

        result = reduce(visits, function (tally, day) {
            var dayOffset = day[0],
                dayVisits = day[1];

            totalVisits += dayVisits;
            return tally + weight * (9 + dayVisits) * (summaryPeriodDays - dayOffset);
        }, 0);

        return totalVisits < minimum ? 0 : result;
    }

    function firstCsv(str) {
        return (str || '').split(',')[0];
    }

    function collapsePath(t) {
        if (t) {
            t = t.replace(/^\/|\/$/g, '');
            if (t.match(isEditionalisedRx)) {
                t = t.replace(stripEditionRx, '');
            }
            t = t.split('/');
            t = t.length === 2 && t[0] === t[1] ? [t[0]] : t;
            return t.join('/');
        } else {
            return '';
        }
    }

    function reset() {
        historyCache = undefined;
        summaryCache = undefined;
        storage.local.remove(storageKeyHistory);
        storage.local.remove(storageKeySummary);
    }

    function logHistory(pageConfig) {
        var pageId = pageConfig.pageId,
            history,
            foundCount = 0;

        if (!pageConfig.isFront) {
            history = getHistory()
                .filter(function (item) {
                    var isArr = isArray(item),
                        found = isArr && (item[0] === pageId);

                    foundCount = found ? item[1] : foundCount;
                    return isArr && !found;
                });

            history.unshift([pageId, foundCount + 1]);
            saveHistory(history.slice(0, historySize));
        }
    }

    function logSummary(pageConfig, mockToday) {
        var summary = pruneSummary(getSummary(), mockToday),
            page = collapsePath(pageConfig.pageId),
            isFront = false;

        chain(pageMeta).and(reduceRight, function (tagMeta, tag) {
                var tid = collapsePath(firstCsv(pageConfig[tag.tid])),
                    tname = tid && firstCsv(pageConfig[tag.tname]);

                if (tid && tname) {
                    tagMeta[tid] = tname;
                }
                isFront = isFront || tid === page;
                return tagMeta;
            }, {}).and(forEach, function (tname, tid) {
                var record = summary.tags[tid] || [],
                    visits,
                    today;

                forEach(buckets, function (bucket) {
                    record[bucket.indexInRecord] = record[bucket.indexInRecord] || [];
                });

                record[0] = tname;

                visits = record[isFront ? 2 : 1];
                today = find(visits, function (day) { return day[0] === 0; });

                if (today) {
                    today[1] = today[1] + 1;
                } else {
                    visits.unshift([0, 1]);
                }

                summary.tags[tid] = record;
            });

        saveSummary(summary);
    }

    function getTopNavItems() {
        topNavItemsCache = topNavItemsCache || $('.js-navigation-header .js-top-navigation a').map(function (item) {
            return collapsePath(url.getPath($(item).attr('href')));
        });

        return topNavItemsCache;
    }

    function getMegaNav() {
        return $('.js-global-navigation');
    }

    function showInMegaNav() {
        var tags, tagsHTML;

        if (getSummary().showInMegaNav === false) { return; }

        if (inMegaNav) { removeFromMegaNav(); }

        tags = getPopularFiltered();

        if (tags.length) {
            tagsHTML = template(viewMegaNav, {tags: tags.map(tagHtml).join('')});
            fastdom.write(function () {
                getMegaNav().prepend(tagsHTML);
            });
            inMegaNav = true;
        }
    }

    function removeFromMegaNav() {
        getMegaNav().each(function (megaNav) {
            fastdom.write(function () {
                $('.js-global-navigation__section--history', megaNav).remove();
            });
        });
        inMegaNav = false;
    }

    function showInMegaNavEnabled() {
        return getSummary().showInMegaNav !== false;
    }

    function showInMegaNavEnable(bool) {
        var summary = getSummary();

        summary.showInMegaNav = !!bool;

        if (summary.showInMegaNav) {
            showInMegaNav();
        } else {
            removeFromMegaNav();
        }

        saveSummary(summary);
    }

    function tagHtml(tag, index) {
        return template(viewTag, {id: tag[0], name: tag[1], index: index + 1});
    }

    return {
        logHistory: logHistory,
        logSummary: logSummary,
        showInMegaNav: showInMegaNav,
        showInMegaNavEnable: showInMegaNavEnable,
        showInMegaNavEnabled: showInMegaNavEnabled,
        getPopular: getPopular,
        getPopularFiltered: getPopularFiltered,
        deleteFromSummary: deleteFromSummary,
        isRevisit: isRevisit,
        reset: reset,

        test: {
            getSummary: getSummary,
            getHistory: getHistory,
            pruneSummary: pruneSummary
        }
    };
});
