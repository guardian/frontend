define([
    'fastdom',
    'common/utils/$',
    'common/utils/config'
], function (
    fastdom,
    $,
    config
) {

    return function () {
        this.id = 'AcrossTheCountry';
        this.start = '2015-03-19';
        this.expiry = '2015-04-26';
        this.author = 'Grant Klopper';
        this.description = 'Checking effect of moving "across the country" container higher up the US front';
        this.audience = 0.5;
        this.audienceOffset = 0.5;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'More people read content off of the US front';

        this.canRun = function () {
            return config.page.pageId === 'us';
        };

        /**
         * nothing happens in here, we just use this to bucket users
         */
        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                // this is all below the fold.
                id: 'variant',
                test: function () {
                    var acrossTheCountryContainer = $('#across-the-country'),
                        highlightsContainer = $('#highlights');
                    if (acrossTheCountryContainer.length === 1 && highlightsContainer.length === 1) {
                        fastdom.write(function () {
                            acrossTheCountryContainer.remove();
                            acrossTheCountryContainer.insertAfter(highlightsContainer);
                        });
                    }
                }
            }
        ];
    };

});
