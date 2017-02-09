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
        id: 'ContributionsEpicBillionaire',
        campaignId: 'kr1_epic_billionaire',

        start: '2017-02-09',
        expiry: '2017-02-22',

        author: 'Jonathan Rankin',
        description: 'Tests a rewrite of the epic centered around our lack of a billionaire owner',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Acquires many Supporters',

        audienceCriteria: 'All',
        audience: 0.2,
        audienceOffset: 0.62,

        variants: [
            {
                id: 'control',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                template: function (contributionUrl, membershipUrl) {
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
                },
                insertBeforeSelector: '.submeta',
                successOnView: true
            },
            {
                id: 'billionaire',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                template: function (contributionUrl, membershipUrl) {
                    return template(contributionsEpicEqualButtons, {
                        linkUrl1: membershipUrl,
                        linkUrl2: contributionUrl,
                        title: 'No billionaire owner … ',
                        p1: '… and no hidden influences. The Guardian has only one shareholder, The Scott Trust, which keeps our independent, investigative, public-interest journalism free from commercial or political pressures.',
                        p2: 'No one can tell us to censor, edit or drop a story.',
                        p3: 'If you value reporting that seeks truth, not approval, that holds power to account on your behalf, then please support the Guardian and help make our future more secure.',
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
