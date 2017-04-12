define([
    'lib/config',
    'lib/cookies',
    'lib/detect',
    'lib/storage',
    'lodash/objects/assign',
    'lib/url',
    'commercial/modules/third-party-tags/krux',
    'common/modules/identity/api',
    'commercial/modules/user-ad-targeting',
    'common/modules/experiments/utils',
    'lodash/arrays/compact',
    'lodash/arrays/uniq',
    'lodash/functions/once',
    'lodash/objects/pick',
    'commercial/modules/commercial-features'
], function (
    config,
    cookies,
    detect,
    storage,
    assign,
    url,
    krux,
    identity,
    userAdTargeting,
    abUtils,
    compact,
    uniq,
    once,
    pick,
    commercialFeatures
) {

    function format(keyword) {
        return keyword.replace(/[+\s]+/g, '-').toLowerCase();
    }

    function formatTarget(target) {
        return target ? format(target).replace(/&/g, 'and').replace(/'/g, '') : null;
    }

    function parseId(id) {
        if (!id) {
            return null;
        }
        if (id === 'uk/uk') {
            return id;
        } else {
            return format(id.split('/').pop());
        }
    }

    function getSeries(page) {
        if (page.seriesId) {
            return parseId(page.seriesId);
        }

        var seriesIdFromUrl = /\/series\/(.+)$/.exec(page.pageId);
        if (seriesIdFromUrl) {
            return seriesIdFromUrl[1];
        }

        if (page.keywordIds) {
            return page.keywordIds
            .split(',')
            .filter(function (keyword) {
                return keyword.indexOf('series/') === 0;
            })
            .slice(0, 1)
            .map(function (seriesId) {
                return seriesId.split('/')[1];
            });
        }

        return null;
    }

    function parseIds(ids) {
        return ids ? compact(ids.split(',').map(parseId)) : null;
    }

    function abParam() {
        var cmRegex = /^(cm|commercial)/;
        var abParticipations = abUtils.getParticipations();
        var abParams = [];

        Object.keys(abParticipations).forEach(function (testKey) {
            var testValue = abParticipations[testKey];
            if (testValue.variant && testValue.variant !== 'notintest') {
                var testData = testKey + '-' + testValue.variant;
                // DFP key-value pairs accept value strings up to 40 characters long
                abParams.push(testData.substring(0, 40));
            }
        });

        if (config.tests) {
            Object.keys(config.tests).forEach(function (testKey) {
                var testValue = config.tests[testKey];
                if (typeof testValue === 'string' && cmRegex.test(testValue)) {
                    abParams.push(testValue);
                }
            });
        }

        return abParams;
    }

    function adtestParams() {
        var cookieAdtest = cookies.get('adtest');
        if (cookieAdtest) {
            if (cookieAdtest.substring(0, 4) === 'demo') {
                cookies.remove('adtest');
            }
            return cookieAdtest;
        }
    }

    function getVisitedValue() {
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
    }

    function getReferrer() {
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
    }

    function getWhitelistedQueryParams() {
        var whiteList = ['0p19G'];
        return pick(url.getUrlVars(), whiteList);
    }

    function getBrandingType() {
        switch(config.page.sponsorshipType) {
            case 'sponsored':
                return 's';
            case 'foundation':
                return 'f';
            case 'paid-content':
                return 'p';
            default:
                return '';
        }
    }

    return once(function () {
        var win         = window;
        var page        = config.page;
        var contentType = formatTarget(page.contentType);
        var platform    = commercialFeatures.adFree ? 'ngaf' : 'ng';
        var advRegion   = config.page.edition.toUpperCase() === 'ROW' ? 'UK' : config.page.edition.toUpperCase();
        var advertiser  = commercialFeatures.adFree ? 'MERCHANDISING ' + advRegion : null;
        var pageTargets = assign({
            adv:     advertiser,
            url:     win.location.pathname,
            edition: page.edition && page.edition.toLowerCase(),
            se:      getSeries(page),
            ct:      contentType,
            p:       platform,
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
            ob:      page.publication === 'The Observer' ? 't' : '',
            ms:      formatTarget(page.source),
            fr:      getVisitedValue(),
            tn:      parseIds(page.tones),
            br:      getBrandingType(),
            // round video duration up to nearest 30 multiple
            vl:      page.videoDuration ? (Math.ceil(page.videoDuration / 30.0) * 30).toString() : undefined
        }, getWhitelistedQueryParams());

        // filter out empty values
        var pageTargeting = pick(pageTargets, function (target) {
            if (Array.isArray(target)) {
                return target.length > 0;
            } else {
                return target;
            }
        });

        // third-parties wish to access our page targeting, before the googletag script is loaded.
        page.appNexusPageTargeting = url.constructQuery({
            pt1: pageTargeting.url,
            pt2: pageTargeting.edition,
            pt3: pageTargeting.ct,
            pt4: pageTargeting.p,
            pt5: pageTargeting.k ? pageTargeting.k.toString() : '', // makes it comma seperated
            pt6: pageTargeting.su,
            pt7: pageTargeting.bp,
            pt8: pageTargeting.x,
            pt9: [pageTargeting.gdncrm, pageTargeting.pv, pageTargeting.co, pageTargeting.tn, pageTargeting.slot].join("|")
        });

        // This can be removed once we get sign-off from third parties who prefer to use appNexusPageTargeting.
        page.pageAdTargeting = pageTargeting;

        return pageTargeting;
    });
});
