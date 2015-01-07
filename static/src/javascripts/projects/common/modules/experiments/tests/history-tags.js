define([
    'common/modules/onward/history'
], function (
    history
    ) {
    return function () {
        this.id = 'HistoryTags';
        this.start = '2014-12-11';
        this.expiry = '2015-02-01';
        this.author = 'Stephan Fowler';
        this.description = 'Test the value of personal history tags';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Click-through to tag pages';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'history tags';
        this.idealOutcome = 'Users use the tags as a navigational aid';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'show',
                test: function () {
                    history.renderInMegaNav();
                }
            }
        ];
    };

});
