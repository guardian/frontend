define([
    'lib/config',
    'common/modules/commercial/contributions-utilities',
    'lodash/objects/assign',
    'lodash/utilities/template',
    'raw-loader!common/views/acquisitions-epic-content-targeting.html'
], function (
    config,
    contributionsUtilities,
    assign,
    template,
    contributionsEpicContentTargeting
) {

    // Common variant properties.
    var defaultVariantArgs = {
        maxViews: {
            days: 30,
            count: 4,
            minDaysBetweenViews: 0
        },
        successOnView: true
    };

    var defaultEpicValues = {
        p1Intro: "… we’ve got a small favour to ask. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And ",
        p1Highlight: "unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can.",
        p1End: "So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.",
        p2: "If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure."
    };

    function buildVariant(variantId, templateArgs) {
        var args = { id: variantId };
        if (variantId !== 'control') {
            args.template = function(variant) {
                var urls = {
                    membershipUrl: variant.membershipURL,
                    contributionUrl: variant.contributeURL
                };
                return template(contributionsEpicContentTargeting, assign({}, defaultEpicValues, templateArgs, urls));
            }
        }
        return assign({}, defaultVariantArgs, args)
    }

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicContentTailoringCif',
        campaignId: 'kr1_epic_content_tailoring_cif',

        start: '2017-03-15',
        expiry: '2017-04-10',

        author: 'Alex Dufournet',
        description: 'This targets articles in the cif section in order to test specific messages',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Acquires more Supporters',

        audienceCriteria: 'All',
        audience: 0.5,
        audienceOffset: 0,

        canRun: function canRun() {
          return config.page.section == "commentisfree";
        },

        variants: [
            buildVariant("control"),
            buildVariant("impact", {p1End: ' The Guardian’s opinion pieces take a lot of time, money and hard work to produce.  But we do it because we believe in a plurality of voices and understanding the world from different perspectives.'}),
            buildVariant("reference", {p1End: ' The Guardian’s opinion pieces take a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.'})
        ]
    });
});
