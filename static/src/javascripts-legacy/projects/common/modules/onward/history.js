/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'fastdom',
    'lib/$',
    'lib/config',
    'lodash/utilities/template',
    'lib/storage',
    'lib/url',
    'raw-loader!common/views/history/tag.html',
    'raw-loader!common/views/history/mega-nav.html',
    'lodash/objects/isObject',
    'lodash/objects/isNumber',
    'lodash/collections/find',
    'lodash/collections/forEach',
    'lodash/collections/some',
    'lodash/objects/keys',
    'lodash/objects/assign',
    'lodash/collections/reduce',
    'lodash/collections/contains',
    'lodash/objects/isArray',
    'lodash/objects/pick',
    'lodash/objects/mapValues'
], function (
    fastdom,
    $,
    config,
    template,
    storage,
    url,
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
    contains,
    isArray,
    pick,
    mapValues
) {
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
        summaryPeriodDays = 90,
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

    function seriesSummary() {
        function views(item) {
            return reduce(item, function (acc, record) {
                return acc + record[1];
            }, 0);
        }

        var seriesTags = pick(getSummary().tags, function(v, k) {
            return contains(k, 'series');
        });

        var seriesTagsSummary = mapValues(seriesTags, function(tag) {
            return views(tag[1]) + views(tag[2]);
        });

        return seriesTagsSummary;
    }

    function mostViewedSeries() {
        return reduce(seriesSummary(), function (best, views, tag, summary) {
            return views > (summary[best] || 0) ? tag : best;
        }, '');
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
                var result = buckets.map(function (bucket) {
                    if (record[bucket.indexInRecord]) {
                        var visits = record[bucket.indexInRecord].map(function (day) {
                            var newAge = day[0] + updateBy;
                            return newAge < summaryPeriodDays && newAge >= 0 ? [newAge, day[1]] : false;
                        }).filter(Boolean);

                        return (visits.length > 1 || (visits.length === 1 && visits[0][0] < forgetUniquesAfter)) ? visits : [];
                    }

                    return [];
                });

                if (result.some(function (r) { return r.length; })) {
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

        return tids.map(function (tid) {
            var record = tags[tid],
                rank = reduce(buckets, function (rank, bucket) {
                    return rank + tally(record[bucket.indexInRecord], op.weights[bucket.type], op.thresholds[bucket.type]);
                }, 0);

            return {
                idAndName: [tid, record[0]],
                rank: rank
            };
        })
        .filter(Boolean)
        .sort(function (a, b) {
          return a.rank - b.rank;
        })
        .slice(-op.number)
        .map(function (tid) {
            return tid.idAndName;
        })
        .reverse();
    }

    function getContributors() {
        var contibutors = [],
            tagId,
            tags = getSummary().tags;
        for (tagId in tags) {
            if (tagId.indexOf('profile/') === 0) {
                contibutors.push(tags[tagId]);
            }
        }
        return contibutors;
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

        var meta = pageMeta.reduceRight(function (tagMeta, tag) {
            var tid = collapsePath(firstCsv(pageConfig[tag.tid])),
                tname = tid && firstCsv(pageConfig[tag.tname]);

            if (tid && tname) {
                tagMeta[tid] = tname;
            }
            isFront = isFront || tid === page;
            return tagMeta;
        }, {});

        Object.keys(meta).forEach(function (tid) {
            var tname = meta[tid],
                record = summary.tags[tid] || [],
                visits,
                today;

            buckets.forEach(function (bucket) {
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
            fastdom.mutate(function () {
                getMegaNav().prepend(tagsHTML);
            });
            inMegaNav = true;
        }
    }

    function removeFromMegaNav() {
        getMegaNav().each(function (megaNav) {
            fastdom.mutate(function () {
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
        getContributors: getContributors,
        deleteFromSummary: deleteFromSummary,
        isRevisit: isRevisit,
        reset: reset,
        seriesSummary: seriesSummary,
        mostViewedSeries: mostViewedSeries,

        test: {
            getSummary: getSummary,
            getHistory: getHistory,
            pruneSummary: pruneSummary,
            seriesSummary: seriesSummary
        }
    };
});
