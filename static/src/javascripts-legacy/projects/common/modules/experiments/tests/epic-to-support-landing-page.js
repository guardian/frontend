define([
    'commercial/modules/commercial-features',
    'common/modules/commercial/contributions-utilities',
    'lib/ajax',
    'lib/config',
    'lib/cookies',
    'lib/storage',
    'lodash/utilities/template',
    'raw-loader!common/views/contributions-epic-single-button.html'
], function (
    commercialFeatures,
    contributionsUtilities,
    ajax,
    config,
    cookies,
    store,
    template,
    contributionsEpicSingleButton
) {

    return contributionsUtilities.makeABTest({
        id: 'EpicToSupportLandingPage',
        campaignId: 'epic_to_support_landing_page',

        start: '2017-03-29',
        expiry: '2017-04-27',

        author: 'Justin Pinner',
        description: 'Use AB framework to push traffic to new supporter landing page.',
        successMeasure: 'There is no noticeable drop-off in contributions.',
        idealOutcome: 'Readers sign up for recurring monthly contributions in droves',

        audienceCriteria: 'UK edition readers',
        audience: 0.2,
        audienceOffset: 0.5,
        showForSensitive: false,
        useTargetingTool: false,

        overrideCanRun: false,
        canRun: function () {
            return config.page.edition.toUpperCase() === 'UK';
        },

        variants: [
            {
                id: 'intest',
                template: function (variant) {
                    return template(contributionsEpicSingleButton, {
                        linkUrl1: variant.makeURL(config.page.supportUrl + '/uk', variant.membershipCampaignCode),
                        componentName: variant.componentName,
                        title: 'Since you’re here…',
                        p1: '… we’ve got a small favour to ask. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And ' +
                        '<span class="contributions__paragraph--highlight">unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can</span>' +
                        '. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                        p2: 'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
                        p3: '',
                        cta1: 'Support the Guardian'
                    });
                },

                insertBeforeSelector: '.submeta',

                successOnView: true
            }
        ]
    });
});
