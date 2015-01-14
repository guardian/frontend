/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/template',
    'common/utils/storage',
    'common/utils/url',
    'text!common/views/history/tag.html',
    'text!common/views/history/tags.html',
    'text!common/views/history/mega-nav.html'
], function (
    $,
    _,
    config,
    template,
    storage,
    url,
    viewTag,
    viewTags,
    viewMegaNav
) {
    var whitelistRx = new RegExp(/^football\/[^\/]+/),
        whitelist = [
            'audioslideshows', 'business/economics', 'business/interest-rates', 'business/markets', 'business/series/andrewclarkonamerica',
            'business/series/davidgowoneurope', 'business/series/viewpointcolumn', 'business/useconomy', 'careers', 'cartoons', 'community',
            'crosswords', 'crosswords/series/cryptic', 'crosswords/series/everyman', 'crosswords/series/prize', 'crosswords/series/quick',
            'data', 'environment/climate-change', 'environment/conservation', 'environment/energy', 'environment/ethical-living',
            'environment/food', 'environment/georgemonbiot', 'environment/list/allenvironmentkeywords', 'environment/travelandtransport',
            'environment/waste', 'football/championsleague', 'guardian-professional', 'inpictures', 'interactive', 'law', 'lifeandstyle',
            'lifeandstyle/series/timdowlingsweekendcolumn', 'lifeandstyle/women', 'media/advertising', 'media/digital-media', 'media/list/allmediakeywords',
            'media/marketingandpr', 'media/mediabusiness', 'media/pressandpublishing', 'media/radio', 'media/television', 'money/consumer-affairs',
            'money/insurance', 'money/isas', 'money/moneyinvestments', 'money/property', 'money/savings', 'money/work-and-careers', 'multimedia',
            'news/guardianfilms', 'profile/charliebrooker', 'profile/davidmitchell', 'profile/georgemonbiot', 'profile/hadleyfreeman', 'profile/johnharris',
            'profile/marinahyde', 'profile/marklawson', 'profile/martinkettle', 'profile/owen-jones', 'profile/pollytoynbee', 'profile/seumasmilne', 'profile/stevebell',
            'profile/suzannemoore', 'profile/zoewilliams', 'science', 'science/science+tone/comment', 'science/sciencenews', 'science/series/badscience',
            'society', 'society/children', 'society/communities', 'society/health', 'society/list/allsocietykeywords', 'society/localgovernment',
            'society/social-care', 'society/voluntarysector', 'technology', 'technology/askjack', 'technology/comment', 'technology/gadgets',
            'technology/games', 'technology/internet', 'technology/it', 'technology/news', 'technology/telecoms', 'theguardian/mainsection/obituaries',
            'theguardian/series/otherlives', 'travel', 'travel/bookatrip', 'travel/hotels', 'travel/lateoffers', 'travel/places', 'travel/restaurants',
            'travel/shortbreaks', 'travel/typesoftrip', 'tv-and-radio', 'uk/technology', 'video', 'weekly'
        ],
        subNav = [
            'artanddesign', 'australia-news', 'books', 'business/companies', 'business/stock-markets', 'cities', 'crosswords', 'education',
            'education/students', 'fashion', 'film', 'football/competitions', 'football/fixtures', 'football/live', 'football/results',
            'football/tables', 'football/teams', 'global-development', 'lifeandstyle', 'lifeandstyle/family', 'lifeandstyle/food-and-drink',
            'lifeandstyle/health-and-wellbeing', 'lifeandstyle/home-and-garden', 'lifeandstyle/love-and-sex', 'lifeandstyle/women', 'money/debt',
            'money/property', 'money/savings', 'money/work-and-careers', 'music', 'music/classicalmusicandopera', 'observer', 'science',
            'society', 'sport/boxing', 'sport/cricket', 'sport/cycling', 'sport/formulaone', 'sport/golf', 'sport/horse-racing', 'sport/rugby-union',
            'sport/tennis', 'sport/us-sport', 'stage', 'technology/games', 'theguardian', 'travel', 'travel/europe', 'travel/uk', 'travel/usa',
            'tv-and-radio', 'video', 'world/africa', 'world/americas', 'world/asia', 'world/europe-news', 'world/middleeast'
        ],
        editions = [
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

        summaryPeriodDays = 30,
        forgetUniquesAfter = 10,
        historySize = 50,

        storageKeyHistory = 'gu.history',
        storageKeySummary = 'gu.history.summary',

        today =  Math.floor(Date.now() / 86400000), // 1 day in ms
        historyCache,
        summaryCache,
        topNavItemsCache,

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
        if (summaryCache) {
            return summaryCache;
        }

        summaryCache = storage.local.get(storageKeySummary);

        if (!_.isObject(summaryCache) || !_.isObject(summaryCache.tags) || !_.isNumber(summaryCache.periodEnd)) {
            summaryCache = {
                periodEnd: today,
                tags: {},
                showInMegaNav: true
            };
        }
        return summaryCache;
    }

    function deleteFromSummary(tag) {
        var summary = getSummary();

        delete summary.tags[tag];
        saveSummary(summary);
    }

    function isRevisit(pageId) {
        return (_.find(getHistory(), function (page) {
            return (page[0] === pageId);
        }) || [])[1] > 1;
    }

    function pruneSummary(summary, mockToday) {
        var newToday = mockToday || today,
            updateBy = newToday - summary.periodEnd;

        if (updateBy !== 0) {
            summary.periodEnd = newToday;

            _.each(summary.tags, function (nameAndFreqs, tid) {
                var freqs = _.chain(nameAndFreqs[1])
                    .map(function (freq) {
                        var newAge = freq[0] + updateBy;
                        return newAge < summaryPeriodDays && newAge >= 0 ? [newAge, freq[1]] : false;
                    })
                    .compact()
                    .value();

                if (freqs.length > 1 || (freqs.length === 1 && freqs[0][0] < forgetUniquesAfter)) {
                    summary.tags[tid] = [nameAndFreqs[0], freqs];
                } else {
                    delete summary.tags[tid];
                }
            });

            if (_.isEmpty(summary.tags)) {
                summary.periodEnd = newToday;
            }
        }

        return summary;
    }

    function getPopular(number, filtered) {
        var tags = getSummary().tags,
            tids = _.keys(tags),
            wList,
            bList;

        if (filtered) {
            wList = whitelist.concat(subNav);
            bList = getTopNavItems();
            tids = tids.filter(function (tid) { return tid.match(whitelistRx) || wList.indexOf(tid) > -1; });
            tids = tids.filter(function (tid) { return bList.indexOf(tid) === -1; });
        }

        return _.chain(tids)
            .map(function (tid) {
                var nameAndFreqs = tags[tid],
                    freqs = nameAndFreqs[1];

                if (freqs.length) {
                    return {
                        keep: [tid, nameAndFreqs[0]],
                        rank: tally(freqs)
                    };
                }
            })
            .compact()
            .sortBy('rank')
            .last(number || 100)
            .reverse()
            .pluck('keep')
            .value();
    }

    function getPopularFiltered() {
        return getPopular(20, true);
    }

    function tally(freqs) {
        return _.reduce(freqs, function (tally, freq) {
            return tally + (9 + freq[1]) * (summaryPeriodDays - freq[0]);
        }, 0);
    }

    function firstCsv(str) {
        return (str || '').split(',')[0];
    }

    function collapseTag(t) {
        t = t.replace(/^\/|\/$/g, '');
        if (t.match(isEditionalisedRx)) {
            t = t.replace(stripEditionRx, '');
        }
        t = t.split('/');
        t = t.length === 2 && t[0] === t[1] ? [t[0]] : t;
        return t.join('/');
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
                    var isArr = _.isArray(item),
                        found = isArr && (item[0] === pageId);

                    foundCount = found ? item[1] : foundCount;
                    return isArr && !found;
                });

            history.unshift([pageId, foundCount + 1]);
            saveHistory(history.slice(0, historySize));
        }
    }

    function logSummary(pageConfig, mockToday) {
        var summary = pruneSummary(getSummary(), mockToday);

        _.chain(pageMeta)
            .reduceRight(function (tags, tag) {
                var tid = firstCsv(pageConfig[tag.tid]),
                    tname = tid && firstCsv(pageConfig[tag.tname]);

                if (tid && tname) {
                    tags[collapseTag(tid)] = tname;
                }
                return tags;
            }, {})
            .each(function (tname, tid) {
                var nameAndFreqs = summary.tags[tid],
                    freqs = nameAndFreqs && nameAndFreqs[1],
                    freq = freqs && _.find(freqs, function (freq) { return freq[0] === 0; });

                if (freq) {
                    freq[1] = freq[1] + 1;
                } else if (freqs) {
                    freqs.unshift([0, 1]);
                } else {
                    summary.tags[tid] = [tname, [[0, 1]]];
                }

                if (nameAndFreqs) {
                    nameAndFreqs[0] = tname;
                }
            });

        saveSummary(summary);
    }

    function getTopNavItems() {
        topNavItemsCache = topNavItemsCache || $('.js-navigation-header .js-top-navigation a').map(function (item) {
            return collapseTag(url.getPath($(item).attr('href')));
        });

        return topNavItemsCache;
    }

    function getMegaNav() {
        return $('.js-global-navigation');
    }

    function showInMegaNav(flush) {
        var tags;

        if (getSummary().showInMegaNav === false) { return; }

        if (flush) { removeFromMegaNav(); }

        tags = getPopularFiltered();

        if (tags.length) {
            getMegaNav().prepend(
                template(viewMegaNav, {
                    tags: tags.slice(0, 20).map(tagHtml).join('')
                })
            );
        }
    }

    function removeFromMegaNav() {
        getMegaNav().each(function () {
            $('.js-global-navigation__section--history', this).remove();
        });
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
