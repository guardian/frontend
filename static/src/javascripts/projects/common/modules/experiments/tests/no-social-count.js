define([
    'common/utils/config',
    'bean'
], function (
    config,
    bean
) {
    return function () {
        var module = this;

        this.id = 'NoSocialCount';
        this.start = '2016-08-25';
        this.expiry = '2016-09-21';
        this.author = 'Gareth Trufitt';
        this.description = 'Test whether the social share counts make a difference to the number of clicks on social buttons';
        this.audience = 0.5;
        this.audienceOffset = 0.5;
        this.successMeasure = 'No significant difference in clicks between the variant and control';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Social sharing in the control group is not more than 2% higher';

        this.canRun = function () {
            // We're on content and the page is commentable (so we don't have to fuss with the gap if it wasn't commentable)
            return config.page.isContent && config.page.commentable;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: userClickedSocialShare
            },
            {
                id: 'no-sharing',
                test: function () {},
                success: userClickedSocialShare
            }
        ];

        function userClickedSocialShare (complete) {
            var socialTopArr = document.querySelectorAll('.js-social--top');

            if (socialTopArr.length > 0 && module.canRun()) {
                bean.on(socialTopArr[0], 'click', document.getElementsByClassName('js-social__action--top'), complete);
            }
        }
    };
});
