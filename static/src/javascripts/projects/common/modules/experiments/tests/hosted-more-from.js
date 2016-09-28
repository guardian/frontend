define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        this.id = 'HostedMoreFrom';
        this.start = '2016-10-03';
        this.expiry = '2016-10-27';
        this.author = 'Zofia Korcz';
        this.description = 'Test whether people will click on the hosted onward journey links more often';
        this.showForSensitive = true;
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'People will click on links from either the first or second variant';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = 'People will click on links from either the first or second variant';

        this.canRun = function () {
            return config.isHosted && config.page.contentType === 'Gallery';
        };


        this.variants = [
            {
                id: 'control',
                test: function () {
                    console.log('control');
                }
            },
            {
                id: 'variant1',
                test: function () {
                    console.log('variant1');
                }
            },
            {
                id: 'variant2',
                test: function () {
                    console.log('variant2');
                }
            }
        ];
    };
});
