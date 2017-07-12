define([
    'bean',
    'qwery',
    'lib/config',
    'lib/detect',
    'lib/cookies',
    'commercial/modules/commercial-features',
    'common/modules/commercial/contributions-utilities',
    'lib/storage',
    'lodash/utilities/template',
    'raw-loader!common/views/contributions-epic-single-button.html'
], function (
    bean,
    qwery,
    config,
    detect,
    cookies,
    commercialFeatures,
    contributionsUtilities,
    store,
    template,
    contributionsEpicSingleButton
) {
    var buildTemplate = function(variant) {
        return template(contributionsEpicSingleButton, {
            linkUrl1: config.page.membershipUrl + '/bundles?INTCMP=' + 'BUNDLE_PRICE_TEST_1M_E_' + config.page.edition.toUpperCase() + '_' + variant.id.toUpperCase(),
            componentName: variant.componentName,
            title: 'Since you’re here…',
            p1: '… we’ve got a small favour to ask. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And ' +
            '<span class="contributions__highlight">unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can</span>' +
            '. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
            p2: 'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
            p3: '',
            cta1: 'Support the Guardian'
        });
    };

    return contributionsUtilities.makeABTest({
        id: 'BundleDigitalSubPriceTest1ME',
        campaignPrefix: '',
        campaignSuffix: '',
        start: '2017-05-10',
        expiry: '2017-07-20',

        author: 'Justin Pinner',
        description: 'Test digital subs price points via epic',
        successMeasure: '',
        idealOutcome: 'Find the price that works for most people',
        hypothesis: 'One of our price points will be more desirable than the others',
        audienceCriteria: 'Non-paying UK edition readers - mobile resolution and above',
        audience: 0.1,
        audienceOffset: 0,
        useTargetingTool: false,

        overrideCanRun: false,
        canRun: function () {
            return !cookies.getCookie('GU_DBPT1ME') &&
                config.page.edition.toUpperCase() === 'UK' &&
                config.page.contentType === 'Article' &&
                !config.page.isMinuteArticle &&
                contributionsUtilities.shouldShowReaderRevenue()
        },

        variants: [
            {
                id: 'A',
                template: buildTemplate,
                insertBeforeSelector: '.submeta',
                successOnView: true
            },
            {
                id: 'B',
                template: buildTemplate,
                insertBeforeSelector: '.submeta',
                successOnView: true
            },
            {
                id: 'C',
                template: buildTemplate,
                insertBeforeSelector: '.submeta',
                successOnView: true
            }
        ]
    });
});
