define([
    'common/modules/commercial/contributions-utilities',
    'raw-loader!common/views/acquisitions-epic-viner-picture.html',
    'common/modules/tailor/tailor',
    'lodash/utilities/template'

], function (
    contributionsUtilities,
    acquisitionsEpicVinerPictureTemplate,
    tailor,
    template
) {

   return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicVinerPicture',
        campaignId: 'kr1_epic_viner_picture',

        start: '2017-01-24',
        expiry: '2017-05-01',

        author: 'Jonathan Rankin',
        description:     "Test an epic with Katharine Viner's picture on it",
        successMeasure: 'Conversion rate',
        idealOutcome: 'Acquires many Supporters',

        audienceCriteria: 'All',
        audience: 0.9,
        audienceOffset: 0,

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
                id: 'viner_picture',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                test: function(render) {
                        return render(function(variant) {
                            return template(acquisitionsEpicVinerPictureTemplate, {
                                membershipUrl: variant.membershipURL,
                                contributionUrl: variant.contributeURL,
                                componentName: variant.componentName
                            });
                        });
                },
                insertBeforeSelector: '.submeta',
                successOnView: true
            }
        ]
    });
});
