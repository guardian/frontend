define([
    'lodash/arrays/compact',
    'common/modules/experiments/tests/editorial-email-variants',
    'common/modules/experiments/tests/opinion-email-variants',
    'common/modules/experiments/tests/recommended-for-you',
    'common/modules/experiments/tests/membership-engagement-banner-tests',
    'common/modules/experiments/tests/paid-content-vs-outbrain',
    'common/modules/experiments/acquisition-test-selector',
    'common/modules/experiments/tests/tailor-recommended-email',
    'common/modules/experiments/tests/membership-a3-a4-bundles-thrasher',
    'common/modules/experiments/tests/tailor-survey',
    'common/modules/experiments/tests/sleeve-notes-new-email-variant',
    'common/modules/experiments/tests/sleeve-notes-legacy-email-variant',
    'common/modules/experiments/tests/increase-inline-ads',
    ],
function(
    compact,
    EditorialEmailVariants,
    OpinionEmailVariants,
    RecommendedForYou,
    MembershipEngagementBannerTests,
    PaidContentVsOutbrain,
    acquisitionTestSelector,
    TailorRecommendedEmail,
    MembershipA3A4BundlesThrasher,
    TailorSurvey,
    SleevenotesNewEmailVariant,
    SleevenotesLegacyEmailVariant,
    IncreaseInlineAds
) {
    var tests = compact([
        new EditorialEmailVariants(),
        new OpinionEmailVariants(),
        new RecommendedForYou(),
        new PaidContentVsOutbrain,
        acquisitionTestSelector.getTest(),
        new TailorRecommendedEmail(),
        new MembershipA3A4BundlesThrasher(),
        new TailorSurvey(),
        SleevenotesNewEmailVariant,
        SleevenotesLegacyEmailVariant,
        new IncreaseInlineAds()
    ].concat(MembershipEngagementBannerTests));

    return function getAbTests() {
        return tests;
    };
});
