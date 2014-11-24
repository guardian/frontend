define([
    'lodash/collections/map',
    'lodash/objects/defaults',
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
    map,
    defaults,
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

    var encodeTargetValue = function (value) {
            return value ? keywords.format(value).replace(/&/g, 'and').replace(/'/g, '') : '';
        },
        parseSeries = function (page) {
            if (page.seriesId) {
                return page.seriesId.split('/').pop();
            }
            var seriesIdFromUrl = /\/series\/(.+)$/.exec(page.pageId);

            return seriesIdFromUrl === null ? '' : seriesIdFromUrl[1];
        },
        parseKeywords = function (keywords) {
            return map((keywords || '').split(','), function (keyword) {
                return keyword.split('/').pop();
            });
        },
        parseTargets = function (targets) {
            var targetArray = parseKeywords(targets);

            return map(targetArray, function (target) {
                return keywords.format(target);
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
            series      = parseSeries(page),
            contentType = encodeTargetValue(page.contentType),
            edition     = encodeTargetValue(page.edition),
            mediaSource = encodeTargetValue(page.source);

        return defaults({
            url:     window.location.pathname,
            edition: edition,
            se:      series,
            ct:      contentType,
            pt:      contentType,
            p:       'ng',
            k:       parseKeywords(page.keywordIds || page.pageId),
            su:      page.isSurging,
            bp:      detect.getBreakpoint(),
            a:       audienceScience.getSegments(),
            at:      cookies.get('adtest') || '',
            gdncrm:  userAdTargeting.getUserSegments(),
            ab:      abParam(),
            co:      parseTargets(page.authorIds),
            bl:      parseKeywords(page.blogIds),
            ms:      mediaSource,
            tn:      parseTargets(page.tones)
        }, audienceScienceGateway.getSegments(), criteo.getSegments());
    };

});
