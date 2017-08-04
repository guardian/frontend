define([
    'lib/config',
    'common/modules/commercial/contributions-utilities'
], function (config, contributionsUtilities) {

    return contributionsUtilities.makeABTest({
        id: 'PaidContentVsOutbrain2',
        start: '2017-04-24',
        expiry: '2018-01-08',
        author: 'Regis Kuckaertz / Lydia Shepherd',
        description: 'Measure the revenue generated (or lost) by replacing the Outbrain widget with a paid content widget',
        audience: .05,
        audienceOffset: 0,
        successMeasure: 'The paid content widget allows to release enough inventory to cover up for the lost revenue from Outbrain',
        audienceCriteria: '',
        dataLinkNames: '',
        idealOutcome: 'We generate more revenue *without* Outbrain and the brand image gets its shiny back',
        showForSensitive: true,

        canRun: function () {
            return config.page.edition === 'UK';
        },

        variants: [
            {
                id: 'paid-content',
                test: function () {
                }
            },
            {
                id: 'outbrain',
                test: function () {
                }
            }
        ]

    });
});
