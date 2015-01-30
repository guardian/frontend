/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/template',
    'common/utils/storage',
    'common/utils/url',
    'text!common/views/history/tag.html',
    'text!common/views/history/mega-nav.html'
], function (
    $,
    _,
    template,
    storage,
    url,
    viewTag,
    viewMegaNav
) {
    var whitelist = [
            'artanddesign', 'artanddesign/photography', 'audioslideshows', 'australia-news', 'books',
            'books/booksblog', 'books/series/abriefsurveyoftheshortstory', 'books/series/books', 'books/series/damien-walter-s-weird-things', 'books/series/my-hero',
            'books/series/poemoftheweek', 'books/series/posterpoems', 'books/series/reading-group', 'books/series/rereading-stephen-king', 'books/series/the-100-best-novels',
            'books/series/toptens', 'business/companies', 'business/economics', 'business/interest-rates', 'business/markets',
            'business/series/andrewclarkonamerica', 'business/series/davidgowoneurope', 'business/series/eurozone-crisis-live', 'business/series/viewpointcolumn', 'business/stock-markets',
            'business/useconomy', 'careers', 'cartoons', 'childrens-books-site/series/how-to-draw', 'childrens-books-site/series/the-book-doctor',
            'cities', 'cities/series/best-city-apps', 'cities/series/cycling-the-city', 'cities/series/sick-cities', 'cities/series/unaffordable-cities',
            'commentisfree/series/first-thoughts', 'commentisfree/series/if', 'commentisfree/series/in-praise-of', 'commentisfree/series/indigenousx', 'commentisfree/series/loose-canon',
            'commentisfree/series/notebook', 'commentisfree/series/open-door', 'commentisfree/series/thepanel', 'community', 'crosswords',
            'crosswords/series/cryptic', 'crosswords/series/everyman', 'crosswords/series/prize', 'crosswords/series/quick', 'culture/series/30-mins-with',
            'culture/series/a-month-in-ambridge', 'culture/series/lastnightstv', 'culture/tvandradioblog', 'data', 'education',
            'education/series/guardian-students', 'education/students', 'environment/bike-blog', 'environment/blog', 'environment/climate-change',
            'environment/conservation', 'environment/energy', 'environment/ethical-living', 'environment/food', 'environment/georgemonbiot',
            'environment/georgemonbiot|environment/damian-carrington-blog', 'environment/list/allenvironmentkeywords', 'environment/series/guardian-environment-blogs', 'environment/series/guardian-environment-network', 'environment/travelandtransport',
            'environment/waste', 'fashion', 'fashion/series/ask-hadley', 'fashion/series/fashion-buy-of-the-day', 'fashion/series/how-i-get-ready',
            'fashion/series/jess-cartner-morley-on-fashion', 'fashion/series/sali-hughes-beauty', 'fashion/series/style-column', 'fashion/series/stylewatch', 'fashion/series/the-measure',
            'film', 'film/filmblog', 'film/series/at-the-british-box-office', 'film/series/box-office-analysis-global', 'film/series/clipjoint',
            'film/series/five-best-moments', 'film/series/guardian-film-show', 'film/series/reelhistory', 'film/series/the-film-quiz', 'film/series/week-in-geek',
            'football', 'football/a-league', 'football/aberdeen', 'football/africannationscup', 'football/almeria',
            'football/arsenal', 'football/aston-villa', 'football/athleticbilbao', 'football/atleticomadrid', 'football/audio/2015/jan/26/football-weekly-podcast-fa-cup-bradford-chelsea',
            'football/barcelona', 'football/birminghamcityfc', 'football/blackburn', 'football/blackpool', 'football/boltonwanderers',
            'football/bournemouth', 'football/brentford', 'football/brightonfootball', 'football/bundesligafootball', 'football/burnley',
            'football/capital-one-cup', 'football/cardiffcity', 'football/celtavigo', 'football/celtic', 'football/championship',
            'football/championsleague', 'football/charltonathletic', 'football/chelsea', 'football/cis-insurance-cup', 'football/competitions',
            'football/copa-america', 'football/crystalpalace', 'football/deportivo-la-coruna', 'football/derbycounty', 'football/dundee',
            'football/dundeeunited', 'football/eibar', 'football/elche-cf', 'football/espanyol', 'football/euro-2016-qualifiers',
            'football/everton', 'football/fa-cup', 'football/fixtures', 'football/friendlies', 'football/fulham',
            'football/gallery/2015/jan/27/wojciech-szczesny-the-gallery', 'football/getafe', 'football/granada74', 'football/hamilton', 'football/huddersfield',
            'football/hullcity', 'football/invernesscaledonianthistle', 'football/ipswichtown', 'football/kilmarnock', 'football/laligafootball',
            'football/leagueonefootball', 'football/leaguetwofootball', 'football/leedsunited', 'football/leicestercity', 'football/levante',
            'football/ligue1football', 'football/live', 'football/liverpool', 'football/malaga', 'football/manchester-united',
            'football/manchestercity', 'football/middlesbrough', 'football/millwall', 'football/mls', 'football/motherwell',
            'football/newcastleunited', 'football/norwichcity', 'football/nottinghamforest', 'football/partick', 'football/premierleague',
            'football/qpr', 'football/rayo-vallecano', 'football/reading', 'football/realmadrid', 'football/realsociedad',
            'football/results', 'football/rosscounty', 'football/rotherham', 'football/scottish-championship', 'football/scottish-league-one',
            'football/scottish-league-two', 'football/scottish-premiership', 'football/scottishcup', 'football/serieafootball', 'football/series/footballweekly',
            'football/series/rumourmill', 'football/series/saidanddone', 'football/series/thefiver', 'football/series/theknowledge', 'football/series/you-are-the-ref',
            'football/sevilla', 'football/sheffieldwednesday', 'football/southampton', 'football/stjohnstone', 'football/stmirren',
            'football/stokecity', 'football/sunderland', 'football/swansea', 'football/tables', 'football/teams',
            'football/tottenham-hotspur', 'football/transfer-window', 'football/uefa-europa-league', 'football/valencia', 'football/villarreal',
            'football/watford', 'football/westbrom', 'football/westhamunited', 'football/wiganathletic', 'football/wolves',
            'football/world-cup-2014', 'football/world-cup-2018', 'global-development', 'global-development-professionals-network', 'guardian-professional',
            'healthcare-network', 'higher-education-network/higher-education-network', 'inpictures', 'interactive', 'ities/urban-decay',
            'law', 'lifeandstyle', 'lifeandstyle/family', 'lifeandstyle/food-and-drink', 'lifeandstyle/health-and-wellbeing',
            'lifeandstyle/home-and-garden', 'lifeandstyle/love-and-sex', 'lifeandstyle/series/aletterto', 'lifeandstyle/series/ask-alys', 'lifeandstyle/series/ask-molly-ringwald',
            'lifeandstyle/series/back-to-basics', 'lifeandstyle/series/blind-date', 'lifeandstyle/series/danpearsonongardens', 'lifeandstyle/series/dearmariella', 'lifeandstyle/series/happy-eater',
            'lifeandstyle/series/how-to-cook-the-perfect', 'lifeandstyle/series/how-to-eat', 'lifeandstyle/series/is-it-worth-it', 'lifeandstyle/series/jayrayner', 'lifeandstyle/series/marina-o-loughlin-on-restaurants',
            'lifeandstyle/series/mid-life-ex-wife', 'lifeandstyle/series/modern-tribes', 'lifeandstyle/series/mrs-cameron-diary', 'lifeandstyle/series/nigelslaterrecipes', 'lifeandstyle/series/privatelives',
            'lifeandstyle/series/problem-solved', 'lifeandstyle/series/recipes-for-life', 'lifeandstyle/series/ruby-bakes', 'lifeandstyle/series/sexualhealing', 'lifeandstyle/series/sudoku',
            'lifeandstyle/series/the-beauty-spot', 'lifeandstyle/series/timdowlingsweekendcolumn', 'lifeandstyle/series/what-im-really-thinking', 'lifeandstyle/series/yotam-ottolenghi-recipes', 'lifeandstyle/women',
            'media', 'media-network', 'media/advertising', 'media/digital-media', 'media/greenslade',
            'media/list/allmediakeywords', 'media/marketingandpr', 'media/mediabusiness', 'media/mediamonkeyblog', 'media/pressandpublishing',
            'media/radio', 'media/television', 'membership', 'money/consumer-affairs', 'money/debt',
            'money/insurance', 'money/isas', 'money/moneyinvestments', 'money/property', 'money/savings',
            'money/series/bachelor-and-brignall-consumer-champions', 'money/series/dearjeremy', 'money/series/expertsproperty', 'money/series/personaleffects', 'money/series/yourproblems',
            'money/work-and-careers', 'money/work-blog', 'multimedia', 'music', 'music/classicalmusicandopera',
            'music/musicblog', 'music/series/cerys-matthews-dr-crotchety', 'music/series/listen-up', 'music/series/newbandoftheday', 'music/series/readersrecommend',
            'music/series/the-playlist', 'music/series/what-you-should-hear-this-week', 'music/tomserviceblog', 'news/guardianfilms', 'news/series/the-daily-quiz',
            'observer', 'politics', 'politics/series/politics-live-with-andrew-sparrow', 'profile/adriansearle', 'profile/andrewpulver',
            'profile/brianlogan', 'profile/catherineshoard', 'profile/charliebrooker', 'profile/david-squires', 'profile/davidmitchell',
            'profile/first-dog-on-the-moon', 'profile/georgemonbiot', 'profile/hadleyfreeman', 'profile/henrybarnes', 'profile/johnharris',
            'profile/johnpatterson', 'profile/jonathanjones', 'profile/lauracumming', 'profile/marinahyde', 'profile/markkermode',
            'profile/marklawson', 'profile/martinkettle', 'profile/martinrowson', 'profile/michaelbillington', 'profile/oliver-wainwright',
            'profile/owen-jones', 'profile/peterbradshaw', 'profile/pollytoynbee', 'profile/rowan-moore', 'profile/seanohagan',
            'profile/seumasmilne', 'profile/stevebell', 'profile/suzannemoore', 'profile/zoewilliams', 'public-leaders-network',
            'science', 'science/across-the-universe', 'science/alexs-adventures-in-numberland', 'science/animal-magic', 'science/blog',
            'science/brain-flapping', 'science/grrlscientist', 'science/head-quarters', 'science/life-and-physics', 'science/neurophilosophy',
            'science/occams-corner', 'science/political-science', 'science/science+tone/comment', 'science/sciencenews', 'science/series/badscience',
            'science/sifting-the-evidence', 'science/the-lay-scientist', 'small-business-network', 'social-care-network', 'society',
            'society/children', 'society/communities', 'society/health', 'society/list/allsocietykeywords', 'society/localgovernment',
            'society/social-care', 'society/voluntarysector', 'sport/blog', 'sport/boxing', 'sport/cricket',
            'sport/cycling', 'sport/formulaone', 'sport/golf', 'sport/horse-racing', 'sport/rugby-union', 'sport/rugbyleague',
            'sport/series/sports-quiz-of-the-week', 'sport/series/the-gifs-that-keep-giving', 'sport/tennis', 'sport/us-sport', 'stage',
            'stage/dance-blog', 'stage/theatreblog', 'teacher-network/teacher-network', 'technology', 'technology/askjack',
            'technology/comment', 'technology/gadgets', 'technology/games', 'technology/internet', 'technology/it',
            'technology/news', 'technology/series/techweekly', 'technology/telecoms', 'theguardian', 'theguardian/mainsection/obituaries',
            'theguardian/series/guardiancommentcartoon', 'theguardian/series/guardianwitness-assignments', 'theguardian/series/otherlives', 'tone/albumreview', 'tone/comment',
            'tone/obituaries', 'tone/livereview', 'travel', 'travel/bookatrip', 'travel/europe', 'travel/hotels',
            'travel/lateoffers', 'travel/places', 'travel/restaurants', 'travel/series/lets-go-to', 'travel/series/readers-travel-tips',
            'travel/shortbreaks', 'travel/typesoftrip', 'travel/uk', 'travel/usa', 'tv-and-radio',
            'tv-and-radio/series/broadchurch-2-episode-by-episode', 'tv-and-radio/series/doctor-who-episode-by-episode', 'tv-and-radio/series/homeland-episode-by-episode', 'tv-and-radio/series/spiral-episode-by-episode-guide', 'tv-and-radio/series/stream-on',
            'tv-and-radio/series/the-fall-episode-by-episode', 'tv-and-radio/series/the-walking-dead-episode-by-episode', 'uk/technology', 'video', 'weekly',
            'women-in-leadership', 'world/africa', 'world/americas', 'world/asia', 'world/europe-news',
            'world/middleeast', 'world/series/eyewitness', 'uk/scotland', 'uk/wales', 'uk/northernireland', 'uk/the-northerner', 'cartoons/archive', 'theguardian'
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
        pageMetaKeys = [
            {tid: 'section',    tname: 'sectionName'},
            {tid: 'keywordIds', tname: 'keywords'},
            {tid: 'seriesId',   tname: 'series'},
            {tid: 'authorIds',  tname: 'author'}
        ],

        weightFront = 1,
        weightArticle = 1,
        weightDay = 10,
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
        if (summaryCache) {
            return summaryCache;
        }

        summaryCache = storage.local.get(storageKeySummary);

        if (!_.isObject(summaryCache) || !_.isObject(summaryCache.tags) || !_.isNumber(summaryCache.periodEnd)) {
            summaryCache = {
                periodEnd: today,
                tags: {},
                showInMegaNav: true,
                v: 2
            };
        }

        if ((summaryCache.v || 1) < 2) {
            upgradeToVersion2(summaryCache);
            saveSummary(summaryCache);
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

            _.each(summary.tags, function (tagMeta, tid) {
                pruneTag(summary, tid, tagMeta, updateBy);
            });

            if (_.isEmpty(summary.tags)) {
                summary.periodEnd = newToday;
            }
        }

        return summary;
    }

    function pruneTag(summary, tid, tagMeta, updateBy) {
        var keep = false;

        _.map([1, 2], function (i) {
            var freqs = (new Array(updateBy)).concat(str2ints(tagMeta[i])).slice(0, summaryPeriodDays);

            if (_.filter(freqs.slice(0, forgetUniquesAfter), _.identity).length === 0 &&
                _.filter(freqs.slice(forgetUniquesAfter), _.identity).length < 2) {
                tagMeta[i] = '';
            } else {
                tagMeta[i] = ints2str(freqs).replace(/\.+$/, '');
                keep = keep || true;
            }
        });

        if (!keep) {
            delete summary.tags[tid];
        }
    }

    function upgradeToVersion2(summary) {
        summary.tags = _.reduce(summary.tags, function (tally, tagMeta, tid) {
            var freqs = _.reduce(tagMeta[1], function (freqs, pair) {
                freqs[pair[0]] = pair[1];
                return freqs;
            }, []);

            tally[tid] = [tagMeta[0], '', ints2str(freqs)];
            return tally;
        }, {});

        summary.v = 2;
    }

    function getPopular(number, filtered) {
        var tags = getSummary().tags,
            tids = _.keys(tags),
            blacklist;

        if (filtered) {
            blacklist = getTopNavItems();
            tids = tids.filter(function (tid) { return whitelist.indexOf(tid) > -1; });
            tids = tids.filter(function (tid) { return blacklist.indexOf(tid) === -1; });
        }

        return _.chain(tids)
            .map(function (tid) {
                var tagMeta = tags[tid];

                return {
                    keep: [tid, tagMeta[0]],
                    rank: tally(tagMeta[1], weightFront) + tally(tagMeta[2], weightArticle)
                };
            })
            .compact()
            .sortBy('rank')
            .last(number || 100)
            .reverse()
            .pluck('keep')
            .value();
    }

    function getPopularFiltered(opts) {
        if (opts && opts.flush) {
            popularFilteredCache = getPopular(10, true);
        } else {
            popularFilteredCache = popularFilteredCache || getPopular(10, true);
        }

        return popularFilteredCache;
    }

    function tally(freqs, weight) {
        return _.reduce(str2ints(freqs), function (tally, freq, day) {
            return tally + (freq > 0 ? (weightDay + freq * weight) * (summaryPeriodDays - day) : 0);
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
        var pageId = pageConfig.pageId,
            summary = pruneSummary(getSummary(), mockToday),
            isFront = false,
            pageMeta = _.chain(pageMetaKeys)
                .reduceRight(function (tags, tag) {
                    var tid = firstCsv(pageConfig[tag.tid]),
                        tname = tid && firstCsv(pageConfig[tag.tname]);

                    if (tid && tname) {
                        tags[collapseTag(tid)] = tname;
                    }

                    isFront = isFront || tid === pageId;

                    return tags;
                }, {})
                .value();

        _.each(pageMeta, function (tname, tid) {
            logTag(summary, tname, tid, isFront);
        });

        saveSummary(summary);
    }

    function logTag(summary, tname, tid, isFront) {
        var i = isFront ? 1 : 2,
            tagMeta = summary.tags[tid],
            freqs = tagMeta && str2ints(tagMeta[i]) || [];

        if (_.isNumber(freqs[0])) {
            freqs[0] = freqs[0] + 1;
            tagMeta[i] = ints2str(freqs);
        } else {
            summary.tags[tid] = [tname, isFront ? '1' : '', isFront ? '' : '1'];
        }

        if (tagMeta) {
            tagMeta[0] = tname;
        }
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

    function showInMegaNav() {
        var tags;

        if (getSummary().showInMegaNav === false) { return; }

        if (inMegaNav) { removeFromMegaNav(); }

        tags = getPopularFiltered();

        if (tags.length) {
            getMegaNav().prepend(
                template(viewMegaNav, {
                    tags: tags.map(tagHtml).join('')
                })
            );
            inMegaNav = true;
        }
    }

    function removeFromMegaNav() {
        getMegaNav().each(function () {
            $('.js-global-navigation__section--history', this).remove();
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

    function str2ints(str) {
        return _.isString(str) ? _.map(str.split('.'), function (s) {return s ? parseInt(s, 10) : 0;}) : [];
    }

    function ints2str(arr) {
        return _.map(arr, function (n) {return n || null;}).join('.');
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
