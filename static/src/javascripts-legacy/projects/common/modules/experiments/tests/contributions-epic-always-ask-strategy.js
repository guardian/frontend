define([
    'commercial/modules/commercial-features',
    'common/modules/commercial/contributions-utilities',
    'lib/config',
    'lib/cookies',
    'lib/storage',
    'lodash/utilities/template',
    'raw-loader!common/views/contributions-epic-equal-buttons.html',
], function (
            commercialFeatures,
            contributionsUtilities,
            config,
            cookies,
            store,
            template,
            contributionsEpicEqualButtons) {

    function canBeDisplayed() {
        var userHasNeverContributed = !cookies.getCookie('gu.contributions.contrib-timestamp');
        var worksWellWithPageTemplate = (config.page.contentType === 'Article') && !config.page.isMinuteArticle; // may render badly on other types
        var isSensitive = config.page.isSensitive === true;

        return userHasNeverContributed &&
            commercialFeatures.canReasonablyAskForMoney &&
            worksWellWithPageTemplate && !isSensitive;
    }

    return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicAlwaysAskStrategy',
        campaignId: 'epic_always_ask_strategy',

        start: '2016-12-06',
        expiry: '2017-05-01',

        author: 'Guy Dawson',
        description: 'Test to assess the effects of always asking readers to contribute via the Epic over a prolonged period.',
        successMeasure: 'We are able to measure the positive and negative effects of this strategy.',
        idealOutcome: 'There are no negative effects and this is the optimum strategy!',

        audienceCriteria: 'All',
        audience: 0.02,
        audienceOffset: 0.88,
        showForSensitive: true,
        useTargetingTool: true,

        overrideCanRun: true,
        canRun: function () {
            return true;
        },

        variants: [
            {
                id: 'control',
                test: function() {},
                isUnlimited : true

            },

            {
                id: 'alwaysAsk',
                template: function (variant) {
                    return template(contributionsEpicEqualButtons, {
                        linkUrl1: variant.membershipURL,
                        linkUrl2: variant.contributeURL,
                        componentName: variant.componentName,
                        title: 'Since you’re here…',
                        p1: '… we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why we need to ask for your help. The Guardian\'s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                        p2: 'If everyone who reads our reporting, who likes it, helps to pay for it, our future would be much more secure.',
                        p3: '',
                        cta1: 'Become a Supporter',
                        cta2: 'Make a contribution'
                    });
                },

                insertBeforeSelector: '.submeta',

                test: function (render) {
                    if (canBeDisplayed()) render();
                },
                isUnlimited : true,
                successOnView: true
            }
        ]
    });
});
