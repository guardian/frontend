define([
    'common/modules/commercial/contributions-utilities',
    'lib/geolocation'
], function (
    contributionsUtilities,
    geolocation
) {

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicArticle50Trigger',
        campaignId: 'epic_article_50_trigger',

        start: '2017-03-14',
        expiry: '2017-04-13',

        author: 'Guy Dawson',
        description: '',
        successMeasure: 'Member acquisition and contributions',
        idealOutcome: 'Our wonderful readers will support The Guardian in this time of need!',

        audienceCriteria: 'Europe',
        audience: 1,
        audienceOffset: 0,
        useTargetingTool: true,

        canRun: function() {
          return geolocation.isInEurope();
        },

        variants: [
            {
                id: 'control',
                maxViews: {
                    days: 7,
                    count: 6,
                    minDaysBetweenViews: 1
                },
                insertBeforeSelector: '.submeta',
                successOnView: true
            }
        ]
    });
});
