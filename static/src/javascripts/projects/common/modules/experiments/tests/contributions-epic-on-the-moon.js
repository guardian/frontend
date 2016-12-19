define([
    'common/modules/commercial/contributions-utilities',
    'common/utils/geolocation',
    'common/utils/template',
    'text!common/views/contributions-epic-image.html',
    'text!common/views/contributions-epic-equal-buttons.html',
    'common/utils/config'
], function (
    contributionsUtilities,
    geolocation,
    template,
    contributionsEpicImage,
    contributionsEpicEqualButtons,
    config
) {

    function testAustralia(render) {
        geolocation.get().then(function(geo) {
            if (geo === 'AU') render();
        });
    }

    return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicOnTheMoon',
        campaignId: 'epic_end_of_year_2016',
        start: '2016-12-13',
        expiry: '2017-01-12',

        author: 'Alex Dufournet',
        description: 'Test with Epic variant containing a message from First Dog on the Moon',
        successMeasure: 'Conversion rate (contributions / impressions)',
        idealOutcome: 'There are no negative effects and this is the optimum strategy!',

        audienceCriteria: 'AUS readers',
        audience: 1,
        audienceOffset: 0,
        useTargetingTool: true,

        membershipCampaignPrefix: 'gdnwb_copts_mem',
        contributionsCampaignPrefix: 'co_au',


        /**
         * In addition to the typical contributions criteria (in contributions-utilities) we need to exclude anyone
         * in the "always ask" strategy test
         */
        canRun: function () {
            return !contributionsUtilities.inAlwaysAskTest()
        },

        variants: [
            {
                id: 'control',

                template: function (contributionUrl, membershipUrl) {
                    return template(contributionsEpicEqualButtons, {
                        linkUrl1: membershipUrl,
                        linkUrl2: contributionUrl,
                        title: 'Since you\'re here…',
                        p1: '…we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why we need to ask for your help. The Guardian\'s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                        p2: 'If everyone who reads our reporting, who likes it, helps to pay for it our future would be much more secure.',
                        cta1: 'Become a supporter',
                        cta2: 'Make a contribution'
                    });
                },

                insertBeforeSelector: '.submeta',

                test: testAustralia,

                impressionOnInsert: true,
                successOnView: true
            },
            {
                id: 'firstDog',

                template: function (contributionUrl, membershipUrl) {
                    return template(contributionsEpicImage, {
                        linkUrl1: membershipUrl,
                        linkUrl2: contributionUrl,
                        defaultImgSrc: config.images.contributions['ab-first-dog-mb'],
                        alt: 'First Dog on the Moon supports the guardian',
                        sources: [
                            {src: config.images.contributions['ab-first-dog-dt'], media:'(min-width:580px)'},
                            {src: config.images.contributions['ab-first-dog-mb'], media:'(max-width:580px)'}
                        ],
                        cta1: 'Become a supporter',
                        cta2: 'Make a contribution'
                    });
                },

                insertBeforeSelector: '.submeta',

                test: testAustralia,

                impressionOnInsert: true,
                successOnView: true
            },
            {
                id: 'australiaNewsroom',

                template: function (contributionUrl, membershipUrl) {
                    return template(contributionsEpicEqualButtons, {
                        linkUrl1: membershipUrl,
                        linkUrl2: contributionUrl,
                        title: 'Since you’re here…',
                        p1: '…we have a favour to ask. Guardian Australia launched three years ago and although many people read it, few pay for it. We fund our content through advertising, but revenues across the media are falling fast. So we need your help. Our independent, investigative reporting takes a lot of time, money and hard work to produce.',
                        p2: 'Any money raised from readers goes directly to fund Guardian Australia\'s journalism, so if everyone who reads it – who believes in it – helps to support it, our future would be more secure.',
                        cta1: 'Become a supporter',
                        cta2: 'Make a contribution'
                    });
                },

                insertBeforeSelector: '.submeta',

                test: testAustralia,

                impressionOnInsert: true,
                successOnView: true
            }
        ]
    });
});
