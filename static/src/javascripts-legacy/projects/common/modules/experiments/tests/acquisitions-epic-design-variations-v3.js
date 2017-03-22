define([
    'common/modules/commercial/contributions-utilities',
    'lib/config',
    'lodash/utilities/template',
    'lodash/objects/assign',
    'raw-loader!common/views/acquisitions-epic-design-variations.html'
], function(
    contributionUtilities,
    config,
    template,
    assign,
    acquisitionEpicDesignVariations
) {

    // Building the Epic component using the template acquisitions-epic-design-variations.html
    // =======================================================================================

    var EMPTY = '';

    // Default arguments for the template.
    var defaultTemplateArgument = {
        // copy
        p1: '… we’ve got a small favour to ask. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And ' +
            '<span class="contributions__paragraph--highlight">unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can</span>' +
            '. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
        p2: 'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
        p3: EMPTY,

        // element classes
        epicClass: EMPTY ,
        epicTitleClass: EMPTY,
        p1Class: EMPTY,
        buttonClass: EMPTY,
        paypalAndCreditCardImageClass: EMPTY,

        // images
        paypalAndCreditCardImageSrc: EMPTY
    };

    // Merges submitted and default template arguments.
    function buildTemplateArguments(variant, args) {
        return assign({}, defaultTemplateArgument, args, {
            membershipUrl: variant.membershipURL,
            contributionUrl: variant.contributeURL,
            componentName: variant.componentName
        });
    }


    function buildHtml(variant, args) {
        return template(acquisitionEpicDesignVariations, buildTemplateArguments(variant, args));
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
        if (templateArgs) {
            args.template = function(variant) {
                return buildHtml(variant, templateArgs)
            }
        }
        return assign({}, defaultVariantArgs, args)
    }

    // this is to prevent the tests failing, as the dummy config object used by tests won't include this property
    var paypalAndCreditCardImage = (function() {
        try { return config.images.acquisitions.paypalAndCreditCard; }
        catch (e) { return ''; }
    })();

    // Building the test
    // =================

    return contributionUtilities.makeABTest({
        id: 'AcquisitionsEpicDesignVariationsV3',
        campaignId: 'kr1_epic_design_variations_v3',

        start: '2017-03-22',
        expiry: '2017-04-30',

        author: 'Guy Dawson',
        description: 'Test 4 new design variants to the Epic',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Find a variant which has a higher conversion rate than the control',

        audienceCriteria: 'All',
        audience: 0.4,
        audienceOffset: 0.5,

        variants: [
            buildVariant('control'),

            buildVariant('bigger_buttons', {
                epicClass: 'contributions__epic--button-bigger',
                buttonClass: 'contributions__button--bigger'
            }),

            buildVariant('colour_change', {
                epicClass: 'contributions__epic--colour-change',
                buttonClass: 'contributions__button--colour-change'
            }),

            buildVariant('paypal_and_credit_card', {
                paypalAndCreditCardImageSrc: paypalAndCreditCardImage,
                paypalAndCreditCardImageClass: 'contributions__image--paypal-and-credit-card'
            })
        ]
    });
});
