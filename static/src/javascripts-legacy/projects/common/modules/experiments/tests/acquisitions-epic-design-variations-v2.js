define([
    'common/modules/commercial/contributions-utilities',
    'lodash/utilities/template',
    'lodash/objects/assign',
    'raw-loader!common/views/acquisitions-epic-design-variations.html'
], function(
    contributionUtilities,
    template,
    assign,
    acquisitionEpicDesignVariations
) {

    // Building the Epic component using the template acquisitions-epic-design-variations.html
    // =======================================================================================

    // Default arguments for the template.
    var defaultTemplateArgument = {
        // copy
        p1: '… we’ve got a small favour to ask. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And unlike some other news organisations, we haven’t put up a paywall – we want to keep our journalism open to all. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
        p1Highlight: '',
        p1PostHighlight: '',
        p2: 'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
        p3: '',

        // element classes
        epicClass: '' ,
        epicTitleClass: '',
        p1Class: '',
        p1HighlightClass: '',
        buttonClass: ''
    };

    // Merges submitted and default template arguments.
    function buildTemplateArguments(membershipUrl, contributionUrl, args) {
        return assign({}, defaultTemplateArgument, args, {
            membershipUrl: membershipUrl,
            contributionUrl: contributionUrl
        });
    }

    function buildHtml(membershipUrl, contributionUrl, args) {
        return template(acquisitionEpicDesignVariations, buildTemplateArguments(membershipUrl, contributionUrl, args));
    }

    // Building a test variant
    // =======================

    // Common variant properties.
    var defaultVariantArgs = {
        maxViews: {
            days: 30,
            count: 4,
            minDaysBetweenViews: 0
        },
        successOnView: true
    };

    function buildVariant(variantId, templateArgs) {
        var args = { id: variantId };
        if (variantId !== 'control') {
            args.template = function(variant) {
                return buildHtml(variant.membershipURL, variant.contributeURL, templateArgs)
            }
        }
        return assign({}, defaultVariantArgs, args)
    }

    // Building the test
    // =================

    return contributionUtilities.makeABTest({
        id: 'AcquisitionsEpicDesignVariationsV2',
        campaignId: 'kr1_epic_design_variations_v2',

        start: '2017-03-10',
        expiry: '2017-03-24',

        author: 'Jonathan Rankin',
        description: 'Test a combination of the 2 best variants from the last design test',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Find a variant which has a higher conversion rate than the control',

        audienceCriteria: 'All',
        audience: 0.5,
        audienceOffset: 0.5,

        variants: [
            buildVariant('control', {
                p1: '… we’ve got a small favour to ask. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And ',
                p1Highlight: 'unlike some other news organisations, we haven’t put up a paywall – we want to keep our journalism open to all',
                p1PostHighlight: '. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                p2: 'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
                p1HighlightClass: 'contributions__paragraph--highlight'
            }),

            buildVariant('subtle_highlight', {
                epicClass: 'contributions__epic--subtle',
                epicTitleClass: 'contributions__title--epic--subtle',
                p1Class: 'contributions__paragraph--subtle',
                p1: '… we’ve got a small favour to ask. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And ',
                p1Highlight: 'unlike some other news organisations, we haven’t put up a paywall – we want to keep our journalism open to all',
                p1PostHighlight: '. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                p2: 'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
                p1HighlightClass: 'contributions__paragraph--highlight'
            })
        ]
    })
});
