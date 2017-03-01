define([
    'common/modules/commercial/contributions-utilities',
    'common/utils/template',
    'raw-loader!common/views/contributions-epic-equal-buttons.html'
], function (
    contributionsUtilities,
    template,
    contributionsEpicEqualButtons
) {

    return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicUrgency',
        campaignId: 'kr1_epic_urgency',

        start: '2017-03-01',
        expiry: '2017-03-15',

        author: 'Jonathan Rankin',
        description: 'Test 3 new variants with messaging that highlights the urgency of supporting the Guardian',
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
                insertBeforeSelector: '.submeta',
                successOnView: true
            },
            {
                id: 'paywall_tweak',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                template: function (contributionUrl, membershipUrl) {
                    return template(contributionsEpicEqualButtons, {
                        linkUrl1: membershipUrl,
                        linkUrl2: contributionUrl,
                        title: 'Now is the time …',
                        p1: '… to support independent journalism. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall. So now we need your support. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
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
                id: 'values_tweak',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                template: function (contributionUrl, membershipUrl) {
                    return template(contributionsEpicEqualButtons, {
                        linkUrl1: membershipUrl,
                        linkUrl2: contributionUrl,
                        title: 'Now is the time …',
                        p1: '… to defend progressive values and truthful, in-depth reporting. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And unlike some other news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can. So now we need your support. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because, at a time of fake news and ‘alternative facts’, we believe our perspective matters more than ever.',
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
                id: 'values_full',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                template: function (contributionUrl, membershipUrl) {
                    return template(contributionsEpicEqualButtons, {
                        linkUrl1: membershipUrl,
                        linkUrl2: contributionUrl,
                        title: 'Now is the time …',
                        p1: '… to defend truthful, in-depth reporting. With the rise of fake news and ‘alternative facts’, the role of independent, investigative journalism is more important than ever. We do it because we believe our perspective matters – because it might well be your perspective, too. But it takes a lot of time, money and hard work to produce. Increasing numbers of people are turning to the Guardian, and now we need your support so that progressive ideas and voices can continue to inform and challenge.',
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
