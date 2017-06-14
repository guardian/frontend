define([
    'lodash/utilities/template',
    'commercial/modules/user-features',
    'common/modules/commercial/contributions-utilities',
    'lib/config',
    'raw-loader!common/views/acquisitions-epic-thank-you.html'
], function (
    template,
    userFeatures,
    contributionsUtilities,
    config,
    acquisitionsEpicThankYouTemplate
) {

    function isRecentContributor() {
        return contributionsUtilities.daysSinceLastContribution < 180
    }

    function isTargetReader() {
        return userFeatures.isPayingMember() || isRecentContributor()
    }

    function worksWellWithPageTemplate() {
        return config.page.contentType === 'Article' &&
            !config.page.isMinuteArticle &&
            !(config.page.isImmersive === true)
    }

    function isTargetPage() {
        return worksWellWithPageTemplate() &&
            !config.page.isPaidContent &&
            !config.page.shouldHideAdverts
    }

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicThankYou',
        campaignId: 'epic_thank_you',

        start: '2017-06-01',
        expiry: '2017-06-19',

        author: 'Guy Dawson',
        description: 'Bootstrap the AB test framework to use the Epic to thank readers who have already supported the Guardian',
        successMeasure: 'N/A',
        idealOutcome: 'N/A',
        audienceCriteria: 'Readers who have supported the Guardian',
        audience: 1,
        audienceOffset: 0,

        overrideCanRun: true,

        canRun: function() {
            return isTargetReader() && isTargetPage();
        },

        useLocalViewLog: true,

        variants: [
            {
                id: 'control',

                maxViews: {
                  days: 365, // Arbitrarily high number - reader should only see the thank-you for one 'cycle'.
                  count: 1,
                  minDaysBetweenViews: 0
                },

                template: function(variant) {
                    return template(acquisitionsEpicThankYouTemplate, {
                        componentName: variant.options.componentName,
                        membershipUrl: variant.getURL("https://www.theguardian.com/membership", variant.options.campaignCode)
                    })
                }
            }
        ]
    });
});
