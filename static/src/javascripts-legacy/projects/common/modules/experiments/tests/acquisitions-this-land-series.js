define([
    'common/modules/commercial/contributions-utilities',
    'lodash/utilities/template',
    'raw-loader!common/views/acquisitions-epic-iframe.html',
], function (contributionsUtilities, template, iframeTemplate) {
    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsThisLandSeriesEpic',
        campaignId: 'this_land_epic_bottom_series',

        start: '2017-06-02',
        expiry: '2017-08-01',

        author: 'Sam Desborough',
        description: 'Display a custom Epic on This Land Is Your Land articles',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Lots of supporters and contributions',

        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,

        showForSensitive: true,
        showToContributors: true,
        showToSupporters: true,

        useTargetingTool: true,

        variants: [
            {
                id: 'control',
                isUnlimited: true,
                template: function(variant) {
                    return template(iframeTemplate, {
                        componentName: variant.options.componentName,
                        id: variant.options.iframeId,
                        iframeUrl: 'https://interactive.guim.co.uk/embed/2017/05/this-land-is-your-land/contribute-series.html',
                    })
                },
                usesIframe: true
            }
        ]
    });
});
