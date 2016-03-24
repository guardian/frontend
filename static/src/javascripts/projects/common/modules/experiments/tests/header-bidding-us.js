define([
    'common/utils/config',
    'lodash/utilities/noop'
], function (
    config,
    noop
) {
    return function () {
        this.id = 'HeaderBiddingUs';
        this.start = '2016-03-08';
        this.expiry = '2016-04-06';
        this.author = 'Jimmy Breck-McKye, Zofia Korcz';
        this.description = 'Auction adverts on the client before calling DFP (US edition only)';

        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.edition === 'US';
        };

        this.variants = [
            {
                id: 'variant',
                test: noop
            }
        ];
    };
});
