define([
    'lodash/arrays/compact',
    'lodash/arrays/uniq',
    'lodash/collections/map',
    'lodash/objects/isArray',
    'lodash/objects/merge',
    'lodash/objects/pick',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect',
    'common/modules/commercial/third-party-tags/audience-science',
    'common/modules/commercial/third-party-tags/audience-science-gateway',
    'common/modules/commercial/third-party-tags/criteo',
    'common/modules/commercial/third-party-tags/krux',
    'common/modules/commercial/user-ad-targeting',
    'common/modules/experiments/ab'
], function (
    compact,
    uniq,
    map,
    isArray,
    merge,
    pick,
    config,
    cookies,
    detect,
    audienceScience,
    audienceScienceGateway,
    criteo,
    krux,
    userAdTargeting,
    ab
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
            return format(id.split('/').pop());
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
        },
        kruxAbParam = function () {
            var kasTest = ab.getParticipations().KruxAudienceScience;

            return kasTest && kasTest.variant === 'variant';
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
                su:      page.isSurging,
                bp:      detect.getBreakpoint(),
                at:      cookies.get('adtest'),
                gdncrm:  userAdTargeting.getUserSegments(),
                ab:      abParam(),
                co:      parseIds(page.authorIds),
                bl:      parseIds(page.blogIds),
                ms:      formatTarget(page.source),
                tn:      uniq(compact([page.sponsorshipType].concat(parseIds(page.tones)))),
                // round video duration up to nearest 30 multiple
                vl:      page.contentType === 'Video' ? (Math.ceil(page.videoDuration / 30.0) * 30).toString() : undefined
            }, audienceScienceGateway.getSegments(), criteo.getSegments());

        if (kruxAbParam()) {
            pageTargets.x = krux.getSegments();
        } else {
            pageTargets.a = audienceScience.getSegments();
        }

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
