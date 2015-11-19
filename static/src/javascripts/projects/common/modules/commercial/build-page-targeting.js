define([
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/storage',
    'common/modules/commercial/third-party-tags/audience-science-pql',
    'common/modules/commercial/third-party-tags/krux',
    'common/modules/identity/api',
    'common/modules/commercial/user-ad-targeting',
    'common/modules/experiments/ab',
    'lodash/arrays/compact',
    'lodash/collections/map',
    'lodash/objects/forIn',
    'lodash/objects/keys',
    'lodash/objects/merge',
    'lodash/arrays/uniq',
    'lodash/objects/pick',
    'lodash/objects/isArray'
], function (
    config,
    cookies,
    detect,
    storage,
    audienceScienceGateway,
    krux,
    identity,
    userAdTargeting,
    ab,
    compact,
    map,
    forIn,
    keys,
    merge,
    uniq,
    pick,
    isArray) {

    var format = function (keyword) {
            return keyword.replace(/[+\s]+/g, '-').toLowerCase();
        },
        formatTarget = function (target) {
            return target ? format(target).replace(/&/g, 'and').replace(/'/g, '') : null;
        },
        getSeries = function (page) {
            if (page.seriesId) {
                return parseId(page.seriesId);
            }
            var seriesIdFromUrl = /\/series\/(.+)$/.exec(page.pageId);

            return seriesIdFromUrl === null ? '' : seriesIdFromUrl[1];
        },
        parseId = function (id) {
            if (!id) {
                return null;
            }
            if (id === 'uk/uk') {
                return id;
            } else {
                return format(id.split('/').pop());
            }
        },
        parseIds = function (ids) {
            if (!ids) {
                return null;
            }
            return compact(map(
                ids.split(','), function (id) {
                    return parseId(id);
                }
            ));
        },
        abParam = function () {
            var abParams = [],
                abParticipations = ab.getParticipations();

            forIn(abParticipations, function (n, key) {
                if (n.variant && n.variant !== 'notintest') {
                    abParams.push(key + '-' + n.variant.substring(0, 1));
                }
            });

            forIn(keys(config.tests), function (n) {
                if (n.toLowerCase().match(/^cm/)) {
                    abParams.push(n);
                }
            });

            return abParams;
        },
        adtestParams = function () {
            if (cookies.get('adtest')) {
                var cookieAdtest = cookies.get('adtest'),
                    first4Char = cookieAdtest.substring(0, 4);
                if (first4Char === 'demo') {
                    cookies.remove('adtest');
                }
                return cookieAdtest;
            }
        },
        getVisitedValue = function () {
            var alreadyVisited = storage.local.get('gu.alreadyVisited') || 0,
                visitedValue;

            if (alreadyVisited > 4) {
                visitedValue = '5plus';
            } else {
                visitedValue = alreadyVisited.toString();
            }

            return visitedValue;
        },
        getReferrer = function () {
            return referrer;
        };

    return function (opts) {
        var win         = (opts || {}).window || window,
            page        = config.page,
            contentType = formatTarget(page.contentType),
            pageTargets = merge({
                url:     win.location.pathname,
                edition: page.edition && page.edition.toLowerCase(),
                se:      getSeries(page),
                ct:      contentType,
                p:       'ng',
                k:       page.keywordIds ? parseIds(page.keywordIds) : parseId(page.pageId),
                x:       krux.getSegments(),
                su:      page.isSurging,
                pv:      config.ophan.pageViewId,
                bp:      detect.getBreakpoint(),
                at:      adtestParams(),
                si:      identity.isUserLoggedIn() ? 't' : 'f',
                gdncrm:  userAdTargeting.getUserSegments(),
                ab:      abParam(),
                ref:     getReferrer(),
                co:      parseIds(page.authorIds),
                bl:      parseIds(page.blogIds),
                ms:      formatTarget(page.source),
                fr:      getVisitedValue(),
                tn:      uniq(compact([page.sponsorshipType].concat(parseIds(page.tones)))),
                // round video duration up to nearest 30 multiple
                vl:      page.contentType === 'Video' ? (Math.ceil(page.videoDuration / 30.0) * 30).toString() : undefined
            }, audienceScienceGateway.getSegments());

        // filter out empty values
        return pick(pageTargets, function (target) {
            if (isArray(target)) {
                return target.length > 0;
            } else {
                return target;
            }
        });
    };
});
