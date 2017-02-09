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
        id: 'ContributionsEpicAskFourEarning',
        campaignId: 'kr1_epic_ask_four_earning',

        start: '2017-01-24',
        expiry: '2017-05-01',

        author: 'Jonathan Rankin',
        description: 'This places the epic on all articles for all users, with a limit of 4 impressions in any given 30 days',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Acquires many Supporters',

        audienceCriteria: 'All',
        audience: 0.88,
        audienceOffset: 0.12,

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
            }
        ]
    });
});
