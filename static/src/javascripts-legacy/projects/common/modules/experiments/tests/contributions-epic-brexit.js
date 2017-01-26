define([
    'common/modules/commercial/contributions-utilities',
    'common/utils/template',
    'text!common/views/contributions-epic-equal-buttons.html'
], function (
    contributionsUtilities,
    template,
    contributionsEpicEqualButtons
) {

    return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicBrexit',
        campaignId: 'epic_brexit_2017_01',

        start: '2017-01-06',
        expiry: '2017-03-01',

        author: 'Alex Dufournet',
        description: 'Test whether we get a positive effect on membership/contribution by targeting the latest brexit articles',
        successMeasure: 'Conversion rate',
        idealOutcome: 'The conversion rate is equal or above what we have observed on other campaigns',

        audienceCriteria: 'All',
        audience: 0.88,
        audienceOffset: 0.12,
        useTargetingTool: true,

        variants: [
            {
                id: 'control',

                template: function (contributionUrl, membershipUrl) {
                    return template(contributionsEpicEqualButtons, {
                        linkUrl1: membershipUrl,
                        linkUrl2: contributionUrl,
                        title: 'Since you’re here…',
                        p1: '…we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why we need to ask for your help. The Guardian\'s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                        p2: 'If everyone who reads our reporting, who likes it, helps to pay for it, our future would be much more secure.',
                        p3: '',
                        cta1: 'Become a Supporter',
                        cta2: 'Make a contribution'
                    });
                },

                insertBeforeSelector: '.submeta',

                successOnView: true
            }
        ]
    });
});
