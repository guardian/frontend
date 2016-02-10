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
    isArray
) {

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

            forIn(abParticipations, function (n, testKey) {
                if (n.variant && n.variant !== 'notintest') {
                    var testData = testKey + '-' + n.variant;
                    // DFP key-value pairs accept value strings up to 40 characters long
                    abParams.push(testData.substring(0, 40));
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
            var visitCount = storage.local.get('gu.alreadyVisited') || 0;

            if (visitCount <= 5) {
                return visitCount.toString();
            } else if (visitCount >= 6 && visitCount <= 9) {
                return '6-9';
            } else if (visitCount >= 10 && visitCount <= 15) {
                return '10-15';
            } else if (visitCount >= 16 && visitCount <= 19) {
                return '16-19';
            } else if (visitCount >= 20 && visitCount <= 29) {
                return '20-29';
            } else if (visitCount >= 30) {
                return '30plus';
            }
        },
        getReferrer = function () {
            var referrerTypes = [
                    {id: 'facebook', match: 'facebook.com'},
                    {id: 'twitter', match: 't.co/'}, // added (/) because without slash it is picking up reddit.com too
                    {id: 'googleplus', match: 'plus.url.google'},
                    {id: 'reddit', match: 'reddit.com'},
                    {id: 'google', match: 'www.google'}
                ],
                matchedRef = referrerTypes.filter(function (referrerType) {
                    return detect.getReferrer().indexOf(referrerType.match) > -1;
                })[0] || {};

            return matchedRef.id;
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
