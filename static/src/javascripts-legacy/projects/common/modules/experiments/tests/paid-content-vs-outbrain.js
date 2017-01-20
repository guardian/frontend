define([
], function (
) {
    return function () {
        this.id = 'PaidContentVsOutbrain';
        this.start = '2017-01-18';
        this.expiry = '2017-02-18';
        this.author = 'Regis Kuckaertz';
        this.description = 'Measure the revenue generated (or lost) by replacing the Outbrain widget with a paid content widget';
        this.audience = .05;
        this.audienceOffset = 0;
        this.successMeasure = 'The paid content widget allows to release enough inventory to cover up for the lost revenue from Outbrain';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = 'We generate more revenue *without* Outbrain and the brand image gets its shiny back';
        this.showForSensitive = true;

        this.canRun = function () {
          return true;
        };

        this.variants = [
            {
                id: 'paid-content',
                test: function () {}
            },
            {
                id: 'outbrain',
                test: function () {}
            }
        ];
    };
});
