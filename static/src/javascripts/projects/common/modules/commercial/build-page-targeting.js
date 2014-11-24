define([
    'lodash/arrays/compact',
    'lodash/collections/map',
    'lodash/objects/merge',
    'lodash/objects/pick',
    'lodash/utilities/identity',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect',
    'common/modules/commercial/keywords',
    'common/modules/commercial/tags/audience-science',
    'common/modules/commercial/tags/audience-science-gateway',
    'common/modules/commercial/tags/criteo',
    'common/modules/commercial/user-ad-targeting',
    'common/modules/experiments/ab'
], function (
    compact,
    map,
    merge,
    pick,
    identity,
    config,
    cookies,
    detect,
    keywords,
    audienceScience,
    audienceScienceGateway,
    criteo,
    userAdTargeting,
    ab
) {

    var formatTarget = function (target) {
            return target ? keywords.format(target).replace(/&/g, 'and').replace(/'/g, '') : '';
        },
        getSeries = function (page) {
            if (page.seriesId) {
                return parseId(page.seriesId);
            }
            var seriesIdFromUrl = /\/series\/(.+)$/.exec(page.pageId);

            return seriesIdFromUrl === null ? '' : seriesIdFromUrl[1];
        },
        parseId = function (id) {
            return keywords.format(id.split('/').pop());
        },
        parseIds = function (ids) {
            return map((ids || '').split(','), function (id) {
                return parseId(id);
            });
        },
        abParam = function () {
            var hchTest = ab.getParticipations().HighCommercialComponent;
            if (hchTest) {
                switch (hchTest.variant) {
                    case 'control':
                        return '1';
                    case 'variant':
                        return '2';
                }
            }
            return '3';
        };

    return function () {
        var page        = config.page,
            series      = getSeries(page),
            contentType = formatTarget(page.contentType),
            mediaSource = formatTarget(page.source),
            pageTargets = merge({
                url:     window.location.pathname,
                edition: page.edition.toLowerCase(),
                se:      series,
                ct:      contentType,
                pt:      contentType,
                p:       'ng',
                k:       parseIds(page.keywordIds || page.pageId),
                su:      page.isSurging,
                bp:      detect.getBreakpoint(),
                a:       audienceScience.getSegments(),
                at:      cookies.get('adtest'),
                gdncrm:  userAdTargeting.getUserSegments(),
                ab:      abParam(),
                co:      parseIds(page.authorIds),
                bl:      parseIds(page.blogIds),
                ms:      mediaSource,
                tn:      compact(parseIds(page.tones).concat([config.page.sponsorshipType]))
            }, audienceScienceGateway.getSegments(), criteo.getSegments());

        // filter out empty values
        return pick(pageTargets, identity);
    };

});
