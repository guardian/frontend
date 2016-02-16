define([
], function (
) {
    return function () {
        this.id = 'LiveblogToast';
        this.start = '2015-1-21';
        this.expiry = '2016-3-1';
        this.author = 'Josh Holder';
        this.description = 'AB test that enables liveblog toast notifications';
        this.audience = 0.25;
        this.audienceOffset = 0.5;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'toast',
                test: function () {

                }
            }
        ];
    };
});
