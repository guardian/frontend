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
        id: 'ContributionsEpicPaywall',
        campaignId: 'kr1_epic_paywall',

        start: '2017-02-09',
        expiry: '2017-02-22',

        author: 'Jonathan Rankin',
        description: 'Tests a rewrite of the epic centered around our lack of a paywall',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Acquires many Supporters',

        audienceCriteria: 'All',
        audience: 0.1,
        audienceOffset: 0.52,

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
                id: 'paywall',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                template: function (contributionUrl, membershipUrl) {
                    return template(contributionsEpicEqualButtons, {
                        linkUrl1: membershipUrl,
                        linkUrl2: contributionUrl,
                        title: 'Why we’re not behind a paywall',
                        p1: 'In volatile times like these, we believe a more informed society can help to create a fairer, more equal world. Which is why the Guardian’s journalism is still open to everyone – not behind a paywall.',
                        p2: 'Nobody should be excluded from the truth, just because they can’t afford it. Diverse voices deserve to be heard and valued. Politicians – and the rich and powerful – must be held to account for all.',
                        p3: 'If you can, please help to secure the Guardian’s future – and ensure that our independent, investigative journalism remains open, for everyone.',
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
