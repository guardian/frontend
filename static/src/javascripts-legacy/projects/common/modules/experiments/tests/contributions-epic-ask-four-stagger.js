define([
    'common/modules/commercial/contributions-utilities',
    'common/utils/template',
    'text!common/views/contributions-epic-equal-buttons.html'
], function (
    contributionsUtilities,
    template,
    contributionsEpicEqualButtons
) {

    function getTemplate(contributionUrl, membershipUrl) {
        return template(contributionsEpicEqualButtons, {
            linkUrl1: membershipUrl,
            linkUrl2: contributionUrl,
            title: 'Since you’re here …',
            p1: '… we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
            p2: 'If everyone who reads our reporting, who likes it, helps to pay for it, our future would be much more secure.',
            p3: '',
            cta1: 'Become a Supporter',
            cta2: 'Make a contribution'
        });
    }

    return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicAskFourStagger',
        campaignId: 'kr1_epic_ask_four_stagger',

        start: '2017-01-24',
        expiry: '2017-02-24',

        author: 'Jonathan Rankin',
        description: 'Test to see if imposing a minimum-time-between-impressions for the epic has a positive effect on conversion',
        successMeasure: 'Conversion rate',
        idealOutcome: 'We convert more supporters by spacing out Epic impressions',

        audienceCriteria: 'All',
        audience: 0.12,
        audienceOffset: 0,

        variants: [
            {
                id: 'control',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                template: getTemplate,
                insertBeforeSelector: '.submeta',
                successOnView: true
            },

            {
                id: 'stagger_one_day',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 1
                },
                template: getTemplate,
                insertBeforeSelector: '.submeta',
                successOnView: true
            },

            {
                id: 'stagger_three_days',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 3
                },
                template: getTemplate,
                insertBeforeSelector: '.submeta',
                successOnView: true
            }
        ]
    });
});
