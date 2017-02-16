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
        id: 'ContributionsEpicOneLineEditsV2',
        campaignId: 'kr1_epic_one_line_edits_v2',

        start: '2017-02-16',
        expiry: '2017-02-30',

        author: 'Guy Dawson',
        description: 'Test 2 variations to the epic: (1) social proofing; and (2) paywall + no billionaire owner',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Establish which variant has the highest conversion rate',

        audienceCriteria: 'All',
        audience: 0.40,
        audienceOffset: 0.12,

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
                        p1: '… we’ve got a small favour to ask. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And unlike some other news organisations, we haven’t put up a paywall – we want to keep our journalism open to all. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                        p2: 'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
                        p3: '',
                        cta1: 'Become a Supporter',
                        cta2: 'Make a contribution'
                    });
                },
                insertBeforeSelector: '.submeta',
                successOnView: true
            },
            {
                id: 'paywall_and_billionaire',
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
                        p1: '… we’ve got a small favour to ask. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can. So you can see why we need to ask for your help. The Guardian has only one shareholder, The Scott Trust, which keeps our independent, investigative, public-interest journalism free from commercial or political interference. Our journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
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
                id: 'social_proofing',
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
                        p1: '… we’ve got a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                        p2: 'Our journalism is funded by hundreds of thousands of Guardian readers. If you read us, if you like us, then help to support us and make our future much more secure.',
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
