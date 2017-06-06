define([
    'common/modules/commercial/contributions-utilities',
    'lodash/utilities/template',
    'raw-loader!common/views/acquisitions-epic-iframe.html',
], function (contributionsUtilities, template, iframeTemplate) {

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsThisLandEnvironmentEpicEarning',
        campaignId: 'this_land_epic_bottom_environment',

        start: '2017-06-02',
        expiry: '2017-08-01',

        author: 'Sam Desborough',
        description: 'Display a custom Epic on environment articles',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Lots of supporters and contributions',
        audienceCriteria: 'US',
        locations: ['US'],
        audience: 0.7,
        audienceOffset: 0,
        showForSensitive: true,
        useTargetingTool: true,

        variants: [
            {
                id: 'earning',
                isUnlimited: true,
                template: function (variant) {
                    return template(iframeTemplate, {
                        componentName: variant.options.componentName,
                        id: variant.options.iframeId,
                        iframeUrl: 'https://interactive.guim.co.uk/embed/2017/05/this-land-is-your-land/contribute-enviro.html',
                    })
                },
                usesIframe: true
            }
        ]
    });
});
