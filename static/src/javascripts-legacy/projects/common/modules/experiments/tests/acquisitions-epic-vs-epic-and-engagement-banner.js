define([
    'commercial/modules/commercial-features',
    'common/modules/commercial/contributions-utilities',
    'ophan/ng'
], function (
    commercialFeatures,
    contributionsUtilities,
    ophan
) {

    var campaignId = 'epic_vs_epic_and_eb';

    function buildInteractionEvent(channel, variant) {
        return {
            component: channel,
            value: campaignId + '_' + variant
        }
    }

    var buildVariant = contributionsUtilities.variantBuilderFactory({

        maxViews: {
            days: 30,
            count: 4,
            minDaysBetweenViews: 0
        },

        canEpicBeDisplayed: contributionsUtilities.defaultCanEpicBeDisplayed,

        onView: function(variantConfig) {
            ophan.record(buildInteractionEvent('epic', variantConfig.id))
        }
    });

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicVsEpicAndEngagementBanner',
        campaignId: campaignId,

        start: '2017-03-24',
        expiry: '2017-04-15',

        author: 'Guy Dawson',
        description: 'Epic and engagement banner vs the epic only',
        successMeasure: 'Supporter equivalents',
        idealOutcome: 'We are able to establish clearly how the engagement banner and epic interact',

        audienceCriteria: 'All',
        audience: 0.1,
        audienceOffset: 0.9,

        isEngagementBannerTest: true,

        overrideCanRun: true,
        canRun: function() {
            return commercialFeatures.canReasonablyAskForMoney
        },

        variants: [

            buildVariant('control', {
                engagementBannerParams: {
                    interactionOnMessageShown: buildInteractionEvent('engagement-banner', 'control')
                }
            }),

            buildVariant('no_engagement_banner', {
                blockEngagementBanner: true
            })
        ]
    });
});
