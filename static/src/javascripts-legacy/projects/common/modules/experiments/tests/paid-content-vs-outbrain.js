define([
    'lib/config'
], function (config) {
    return function () {
        this.id = 'PaidContentVsOutbrain2';
        this.start = '2017-04-24';
        this.expiry = '2018-01-08';
        this.author = 'Regis Kuckaertz / Lydia Shepherd';
        this.description = 'Measure the revenue generated (or lost) by replacing the Outbrain widget with a paid content widget';
        this.audience = .05;
        this.audienceOffset = 0;
        this.successMeasure = 'The paid content widget allows to release enough inventory to cover up for the lost revenue from Outbrain';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = 'We generate more revenue *without* Outbrain and the brand image gets its shiny back';
        this.showForSensitive = true;

        this.canRun = function () {
            return config.page.edition === 'UK';
        };

        this.variants = [
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
        ];
    };
});
