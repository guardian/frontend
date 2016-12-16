define([
    'common/modules/commercial/contributions-utilities',
    'common/utils/ajax',
    'common/utils/geolocation',
    'common/utils/storage',
    'common/utils/template',
    'text!common/views/contributions-epic-equal-buttons.html',
], function (
    contributionsUtilities,
    ajax,
    geolocation,
    store,
    template,
    contributionsEpicEqualButtons
) {
    return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicUsEoyControl',
        campaignId: 'epic_us_eoy_control',

        start: '2016-12-13',
        expiry: '2017-01-03',

        author: 'Sam Desborough',
        description: 'Run the control variant for 87.5% of the US audience',
        successMeasure: 'Conversion rate (contributions / impressions)',
        idealOutcome: 'A conversion rate of 0.1%',

        audienceCriteria: 'US members',
        audience: 0.875,
        audienceOffset: 0,
        useTargetingTool: true,

        /**
         * In addition to the typical contributions criteria (in contributions-utilities) we need to exclude anyone
         * in the "always ask" strategy test
         */
        canRun: function () {
            return !contributionsUtilities.inAlwaysAskTest();
        },

        variants: [
            {
                id: 'control',

                template: function (membershipUrl, contributionUrl) {
                    return template(contributionsEpicEqualButtons, {
                        linkUrl1: membershipUrl,
                        linkUrl2: contributionUrl,
                        title: 'Since you’re here…',
                        p1: '…we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why we need to ask for your help. The Guardian\'s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                        p2: 'If everyone who reads our reporting, who likes it, helps to pay for it our future would be much more secure.',
                        cta1: 'Become a supporter',
                        cta2: 'Make a contribution',
                    });
                },

                insertBeforeSelector: '.submeta',

                test: function (render) {
                    geolocation.get().then(function(geo) {
                        if (geo === 'US') render();
                    });
                },

                impressionOnInsert: true,
                successOnView: true
            }
        ]
    });
});
