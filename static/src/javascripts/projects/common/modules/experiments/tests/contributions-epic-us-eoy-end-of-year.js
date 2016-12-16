define([
    'common/modules/commercial/contributions-utilities',
    'common/utils/ajax',
    'common/utils/geolocation',
    'common/utils/storage',
    'common/utils/template',
    'text!common/views/contributions-epic-equal-buttons.html',
], function (contributionsUtilities,
             ajax,
             geolocation,
             store,
             template,
             contributionsEpicEqualButtons) {
    return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicUsEoyEndOfYear',
        campaignId: 'epic_us_eoy_end_of_year',

        start: '2016-12-13',
        expiry: '2016-12-31',

        author: 'Sam Desborough',
        description: 'Run the end of year variant for 12.5% of the US audience',
        successMeasure: 'Conversion rate (contributions / impressions)',
        idealOutcome: 'A conversion rate of 0.1%',

        audienceCriteria: 'US members',
        audience: 0.125,
        audienceOffset: 0.875,
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
                id: 'endOfYear',

                template: function (contributionUrl, membershipUrl) {
                    return template(contributionsEpicEqualButtons, {
                        linkUrl1: membershipUrl,
                        linkUrl2: contributionUrl,
                        title: 'As 2016 comes to a close…',
                        p1: '…we would like to ask for your support. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why now is the right time to ask. The Guardian\'s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                        p2: 'If everyone who reads our reporting – who believes in it – helps to support it, our future would be more secure.',
                        p3: '',
                        cta1: 'Become a Supporter',
                        cta2: 'Make a contribution'
                    });
                },

                insertBeforeSelector: '.submeta',

                test: function (render) {
                    geolocation.get().then(function (geo) {
                        if (geo === 'US') render();
                    });
                },

                impressionOnInsert: true,
                successOnView: true
            }
        ]
    });
});
